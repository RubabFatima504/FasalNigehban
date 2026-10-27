"""
MARKET INTELLIGENCE AGENT
Kaam: Best market dhundho, prices compare karo, scenarios banao

v2: Spoilage agent se forecast_events receive karta hai aur
simulate_scenarios() ko pass karta hai — taake scenarios forecast-aware
penalties use kar sakein. LLM prompt mein bhi forecast warnings include
hoti hain.
"""
from langchain_core.messages import HumanMessage, SystemMessage
from agents import llm
from rag.pipeline import search_knowledge
from models.scenario_simulator import simulate_scenarios, find_nearest_market, find_premium_market
from utils.weather import format_events_for_prompt
import json


MARKET_SYSTEM_PROMPT = """You are the Market Intelligence Agent for HarvestGuard.

Your job is to analyze market options for a harvested crop batch and compare selling scenarios.

You will be given:
1. Batch details and current spoilage data
2. Three calculated scenarios with financial outcomes (already adjusted for weather forecast)
3. Relevant market knowledge from RAG
4. Any upcoming weather events that affect transport or storage

Provide:
1. Which scenario is best and WHY (be specific about the financial reasoning)
2. Market timing advice — if there are weather hazards, factor them in explicitly
3. Any transport or road risks the farmer should know about given the forecast

Be concise, factual, and practical. Write for a cooperative worker, not a scientist.
If a scenario has a forecast_warning attached, mention it and explain why it affects the decision.
Keep your response under 250 words."""


async def run_market_agent(batch: dict, spoilage_data: dict) -> dict:
    """
    Market analysis + scenario comparison karo
    Needs spoilage_data from spoilage_agent (which now includes forecast_events)
    """
    # Step 1: Forecast events from spoilage agent's result
    forecast_events = spoilage_data.get("forecast_events", [])

    # Step 2: Scenarios calculate karo — now forecast-aware
    scenarios = simulate_scenarios(
        crop_id=batch["crop_id"],
        quantity_kg=batch["quantity_kg"],
        decay_rate_k=spoilage_data["curve_data"]["decay_rate_k"],
        days_since_harvest=spoilage_data["curve_data"]["days_since_harvest"],
        batch_lat=batch["latitude"],
        batch_lng=batch["longitude"],
        current_value_pct=spoilage_data["curve_data"]["current_value_pct"],
        forecast_events=forecast_events,
    )

    # Step 3: RAG se market knowledge
    rag_query = f"{batch['crop_id'].replace('_', ' ')} market price Pakistan wholesale mandi best time to sell"
    rag_context = search_knowledge(rag_query, k=3)

    # Step 4: Format forecast warnings for LLM prompt
    forecast_prompt_section = format_events_for_prompt(forecast_events)

    # Step 5: Build list of per-scenario warnings (for clearer LLM context)
    scenario_warnings = []
    for s in scenarios:
        if s.get("forecast_warning"):
            w = s["forecast_warning"]
            scenario_warnings.append(
                f"  • {s['title']} ({s['scenario_id']}): WARNING — "
                f"{w['event_type'].replace('_', ' ')} on {w['date']} "
                f"({w['severity']}) — {w['description']}"
            )
    scenario_warnings_text = (
        "\n".join(scenario_warnings) if scenario_warnings
        else "  No forecast warnings on any scenario's transport window."
    )

    # Step 6: LLM analysis
    scenarios_text = json.dumps(scenarios, indent=2, ensure_ascii=False)

    user_message = f"""
Analyze these market scenarios for a batch of {batch['quantity_kg']}kg {batch['crop_id'].replace('_', ' ')}:

SCENARIOS (net_revenue already adjusted for any forecast penalties):
{scenarios_text}

SCENARIO-SPECIFIC FORECAST WARNINGS:
{scenario_warnings_text}

GENERAL WEATHER OUTLOOK (next 7 days):
{forecast_prompt_section}

MARKET CONTEXT:
{rag_context}

Which scenario do you recommend and why? Consider both the financial outcome and the weather forecast risks.
"""

    response = await llm.ainvoke([
        SystemMessage(content=MARKET_SYSTEM_PROMPT),
        HumanMessage(content=user_message),
    ])

    recommended = next((s for s in scenarios if s["is_recommended"]), scenarios[0])

    return {
        "agent": "market_intelligence",
        "status": "completed",
        "scenarios": scenarios,
        "recommended_scenario": recommended["scenario_id"],
        "analysis": response.content,
        "nearest_market": find_nearest_market(batch["latitude"], batch["longitude"]),
    }
