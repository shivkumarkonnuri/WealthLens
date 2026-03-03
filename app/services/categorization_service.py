from typing import Dict


# ==========================================================
# Rule-Based Categorization Engine
# ==========================================================

CATEGORY_RULES: Dict[str, str] = {
    # Income
    "salary": "Income",
    "employer": "Income",
    "bonus": "Income",

    # Subscriptions
    "netflix": "Subscriptions",
    "spotify": "Subscriptions",
    "prime": "Subscriptions",
    "gym": "Subscriptions",

    # Food
    "swiggy": "Food",
    "zomato": "Food",
    "restaurant": "Food",
    "cafe": "Food",

    # Groceries
    "bigbasket": "Groceries",
    "dmart": "Groceries",

    # Shopping
    "amazon": "Shopping",
    "flipkart": "Shopping",

    # Utilities
    "electricity": "Utilities",
    "water": "Utilities",
    "internet": "Utilities",

    # Rent
    "rent": "Rent",
    "landlord": "Rent",
}


def auto_categorize(merchant_name: str, description: str) -> str:
    """
    Simple rule-based categorization.
    Case-insensitive keyword matching.
    """

    text = f"{merchant_name} {description}".lower()

    for keyword, category in CATEGORY_RULES.items():
        if keyword in text:
            return category

    return "Uncategorized"