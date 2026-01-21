"""US States mapping data for news searches."""

US_STATES = {
    "Alabama": {"code": "AL", "capital": "Montgomery"},
    "Alaska": {"code": "AK", "capital": "Juneau"},
    "Arizona": {"code": "AZ", "capital": "Phoenix"},
    "Arkansas": {"code": "AR", "capital": "Little Rock"},
    "California": {"code": "CA", "capital": "Sacramento"},
    "Colorado": {"code": "CO", "capital": "Denver"},
    "Connecticut": {"code": "CT", "capital": "Hartford"},
    "Delaware": {"code": "DE", "capital": "Dover"},
    "Florida": {"code": "FL", "capital": "Tallahassee"},
    "Georgia": {"code": "GA", "capital": "Atlanta"},
    "Hawaii": {"code": "HI", "capital": "Honolulu"},
    "Idaho": {"code": "ID", "capital": "Boise"},
    "Illinois": {"code": "IL", "capital": "Springfield"},
    "Indiana": {"code": "IN", "capital": "Indianapolis"},
    "Iowa": {"code": "IA", "capital": "Des Moines"},
    "Kansas": {"code": "KS", "capital": "Topeka"},
    "Kentucky": {"code": "KY", "capital": "Frankfort"},
    "Louisiana": {"code": "LA", "capital": "Baton Rouge"},
    "Maine": {"code": "ME", "capital": "Augusta"},
    "Maryland": {"code": "MD", "capital": "Annapolis"},
    "Massachusetts": {"code": "MA", "capital": "Boston"},
    "Michigan": {"code": "MI", "capital": "Lansing"},
    "Minnesota": {"code": "MN", "capital": "Saint Paul"},
    "Mississippi": {"code": "MS", "capital": "Jackson"},
    "Missouri": {"code": "MO", "capital": "Jefferson City"},
    "Montana": {"code": "MT", "capital": "Helena"},
    "Nebraska": {"code": "NE", "capital": "Lincoln"},
    "Nevada": {"code": "NV", "capital": "Carson City"},
    "New Hampshire": {"code": "NH", "capital": "Concord"},
    "New Jersey": {"code": "NJ", "capital": "Trenton"},
    "New Mexico": {"code": "NM", "capital": "Santa Fe"},
    "New York": {"code": "NY", "capital": "Albany"},
    "North Carolina": {"code": "NC", "capital": "Raleigh"},
    "North Dakota": {"code": "ND", "capital": "Bismarck"},
    "Ohio": {"code": "OH", "capital": "Columbus"},
    "Oklahoma": {"code": "OK", "capital": "Oklahoma City"},
    "Oregon": {"code": "OR", "capital": "Salem"},
    "Pennsylvania": {"code": "PA", "capital": "Harrisburg"},
    "Rhode Island": {"code": "RI", "capital": "Providence"},
    "South Carolina": {"code": "SC", "capital": "Columbia"},
    "South Dakota": {"code": "SD", "capital": "Pierre"},
    "Tennessee": {"code": "TN", "capital": "Nashville"},
    "Texas": {"code": "TX", "capital": "Austin"},
    "Utah": {"code": "UT", "capital": "Salt Lake City"},
    "Vermont": {"code": "VT", "capital": "Montpelier"},
    "Virginia": {"code": "VA", "capital": "Richmond"},
    "Washington": {"code": "WA", "capital": "Olympia"},
    "West Virginia": {"code": "WV", "capital": "Charleston"},
    "Wisconsin": {"code": "WI", "capital": "Madison"},
    "Wyoming": {"code": "WY", "capital": "Cheyenne"},
    "District of Columbia": {"code": "DC", "capital": "Washington"}
}

def get_state_names() -> list[str]:
    """Return list of all US state names."""
    return list(US_STATES.keys())

def is_valid_state(state_name: str) -> bool:
    """Check if a state name is valid."""
    return state_name in US_STATES

def get_state_code(state_name: str) -> str | None:
    """Get the state code for a given state name."""
    state = US_STATES.get(state_name)
    return state["code"] if state else None
