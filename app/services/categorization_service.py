from typing import Dict

# ==========================================================
# Rule-Based Categorization Engine
# Extended with more Indian merchants & categories
# ==========================================================

CATEGORY_RULES: Dict[str, str] = {
    # Income
    "salary": "Income",
    "employer": "Income",
    "bonus": "Income",
    "refund": "Income",
    "cashback": "Income",
    "interest": "Income",
    "dividend": "Income",

    # Food & Dining
    "swiggy": "Food",
    "zomato": "Food",
    "restaurant": "Food",
    "cafe": "Food",
    "coffee": "Food",
    "dominos": "Food",
    "pizza": "Food",
    "blinkit": "Food",
    "dunzo": "Food",
    "biryani": "Food",
    "hotel": "Food",

    # Groceries
    "bigbasket": "Groceries",
    "dmart": "Groceries",
    "reliance fresh": "Groceries",
    "zepto": "Groceries",
    "supermarket": "Groceries",
    "grocery": "Groceries",
    "kirana": "Groceries",
    "vegetables": "Groceries",
    "fruits": "Groceries",

    # Shopping
    "amazon": "Shopping",
    "flipkart": "Shopping",
    "myntra": "Shopping",
    "ajio": "Shopping",
    "meesho": "Shopping",
    "nykaa": "Shopping",
    "snapdeal": "Shopping",
    "decathlon": "Shopping",
    "lifestyle": "Shopping",
    "shoppers stop": "Shopping",

    # Subscriptions
    "netflix": "Subscriptions",
    "spotify": "Subscriptions",
    "prime": "Subscriptions",
    "gym": "Subscriptions",
    "hotstar": "Subscriptions",
    "zee5": "Subscriptions",
    "sonyliv": "Subscriptions",
    "apple": "Subscriptions",
    "google play": "Subscriptions",
    "youtube premium": "Subscriptions",
    "linkedin": "Subscriptions",

    # Utilities
    "electricity": "Utilities",
    "water": "Utilities",
    "internet": "Utilities",
    "broadband": "Utilities",
    "airtel": "Utilities",
    "jio": "Utilities",
    "bsnl": "Utilities",
    "vi ": "Utilities",
    "vodafone": "Utilities",
    "gas": "Utilities",
    "lpg": "Utilities",
    "mobile recharge": "Utilities",
    "recharge": "Utilities",

    # Rent & Housing
    "rent": "Rent",
    "landlord": "Rent",
    "housing": "Rent",
    "maintenance": "Rent",
    "society": "Rent",

    # Transport
    "uber": "Transport",
    "ola": "Transport",
    "rapido": "Transport",
    "metro": "Transport",
    "petrol": "Transport",
    "fuel": "Transport",
    "parking": "Transport",
    "irctc": "Transport",
    "railways": "Transport",
    "bus": "Transport",
    "auto": "Transport",
    "indigo": "Transport",
    "spicejet": "Transport",
    "air india": "Transport",

    # Health & Medical
    "pharmacy": "Health",
    "hospital": "Health",
    "clinic": "Health",
    "doctor": "Health",
    "medplus": "Health",
    "apollo pharmacy": "Health",
    "1mg": "Health",
    "pharmeasy": "Health",
    "netmeds": "Health",
    "insurance": "Health",

    # Education
    "udemy": "Education",
    "coursera": "Education",
    "byju": "Education",
    "unacademy": "Education",
    "school": "Education",
    "college": "Education",
    "tuition": "Education",
    "books": "Education",

    # Entertainment
    "bookmyshow": "Entertainment",
    "pvr": "Entertainment",
    "inox": "Entertainment",
    "ticketmaster": "Entertainment",
    "gaming": "Entertainment",

    # Investments & Savings
    "zerodha": "Investments",
    "groww": "Investments",
    "mutual fund": "Investments",
    "sip": "Investments",
    "nps": "Investments",
    "ppf": "Investments",
    "fd ": "Investments",
    "rd ": "Investments",

    # Transfers
    "upi": "Transfer",
    "neft": "Transfer",
    "rtgs": "Transfer",
    "imps": "Transfer",
}


def auto_categorize(merchant_name: str, description: str) -> str:
    """
    Rule-based categorization with case-insensitive keyword matching.
    Returns the best matching category or 'Uncategorized'.
    """
    if not merchant_name and not description:
        return "Uncategorized"

    text = f"{merchant_name or ''} {description or ''}".lower().strip()

    for keyword, category in CATEGORY_RULES.items():
        if keyword in text:
            return category

    return "Uncategorized"
