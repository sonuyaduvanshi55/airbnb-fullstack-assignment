from datetime import date, timedelta

from sqlalchemy.orm import Session

from .models import Amenity, Booking, Listing, ListingImage, Review, User


AMENITIES = [
    ("WiFi", "wifi"),
    ("Kitchen", "cooking-pot"),
    ("Pool", "waves"),
    ("Air conditioning", "snowflake"),
    ("Free parking", "car"),
    ("Dedicated workspace", "laptop"),
    ("Mountain view", "mountain"),
    ("Beach access", "umbrella"),
    ("Breakfast", "coffee"),
    ("Washer", "washing-machine"),
    ("Pet friendly", "paw-print"),
    ("Hot tub", "bath"),
]


def unsplash(photo_id: str) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w=1600&q=85"


LISTINGS = [
    {
        "title": "Cliffside sea-view villa with infinity pool",
        "description": "Wake up to uninterrupted Arabian Sea views in this calm, design-forward villa. The open living area flows into a private infinity pool, landscaped deck, and outdoor dining space. A resident caretaker is available during the day, while the fully equipped kitchen and fast WiFi make longer stays effortless.",
        "location": "Vagator, Goa",
        "property_type": "Villa",
        "price": 14500,
        "cleaning": 1800,
        "guests": 8,
        "bedrooms": 4,
        "beds": 4,
        "bathrooms": 4.5,
        "lat": 15.60,
        "lng": 73.74,
        "amenities": ["WiFi", "Kitchen", "Pool", "Air conditioning", "Free parking", "Beach access"],
        "images": [
            unsplash("1601918774946-25832a4be0d6"),
            unsplash("1600607687939-ce8a6c25118c"),
            unsplash("1600566753086-00f18fb6b3ea"),
            unsplash("1600585154340-be6161a56a0c"),
            unsplash("1600210492486-724fe5c67fb0"),
        ],
    },
    {
        "title": "Glass cabin among Himalayan pines",
        "description": "A warm cedar-and-glass cabin tucked into a quiet pine forest above Manali. Enjoy mountain sunsets from the reading loft, cook over a compact island kitchen, and relax by the fireplace after a day on the trails. Ideal for couples, small families, and focused remote-work escapes.",
        "location": "Manali, Himachal Pradesh",
        "property_type": "Cabin",
        "price": 6200,
        "cleaning": 700,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "lat": 32.24,
        "lng": 77.19,
        "amenities": ["WiFi", "Kitchen", "Free parking", "Dedicated workspace", "Mountain view", "Breakfast"],
        "images": [
            unsplash("1449158743715-0a90ebb6d2d8"),
            unsplash("1520250497591-112f2f40a3f4"),
            unsplash("1505691938895-1758d7feb511"),
            unsplash("1484154218962-a197022b5858"),
            unsplash("1464278533981-50106e6176b1"),
        ],
    },
    {
        "title": "Restored pink-city haveli courtyard suite",
        "description": "Stay inside a lovingly restored haveli with hand-painted arches, a shaded central courtyard, and locally crafted furniture. The suite balances heritage details with modern comforts, including air conditioning, a rainfall shower, and a generous breakfast served on the terrace.",
        "location": "Jaipur, Rajasthan",
        "property_type": "Heritage home",
        "price": 7800,
        "cleaning": 900,
        "guests": 3,
        "bedrooms": 1,
        "beds": 2,
        "bathrooms": 1,
        "lat": 26.91,
        "lng": 75.79,
        "amenities": ["WiFi", "Air conditioning", "Breakfast", "Dedicated workspace"],
        "images": [
            unsplash("1571896349842-33c89424de2d"),
            unsplash("1566073771259-6a8506099945"),
            unsplash("1540541338287-41700207dee6"),
            unsplash("1566665797739-1674de7a421a"),
            unsplash("1582719478250-c89cae4dc85b"),
        ],
    },
    {
        "title": "Skyline apartment near Indiranagar",
        "description": "A bright, modern apartment with skyline views, hotel-grade bedding, and a dedicated workstation. Cafes, metro access, and Bengaluru's best dining are minutes away. The building includes secure parking, a gym, and a rooftop lounge.",
        "location": "Bengaluru, Karnataka",
        "property_type": "Apartment",
        "price": 5100,
        "cleaning": 650,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "lat": 12.97,
        "lng": 77.64,
        "amenities": ["WiFi", "Kitchen", "Air conditioning", "Free parking", "Dedicated workspace", "Washer"],
        "images": [
            unsplash("1522708323590-d24dbb6b0267"),
            unsplash("1502672260266-1c1ef2d93688"),
            unsplash("1560448204-e02f11c3d0e2"),
            unsplash("1493663284031-b7e3aefcae8e"),
            unsplash("1560185007-c5ca9d2c014d"),
        ],
    },
    {
        "title": "Quiet beach house with private garden",
        "description": "A breezy coastal home set behind a private garden and a two-minute walk from the beach. French doors open onto a shaded veranda, while the outdoor shower and barbecue area make it easy to spend the whole day outside.",
        "location": "Alibaug, Maharashtra",
        "property_type": "Beach house",
        "price": 9800,
        "cleaning": 1300,
        "guests": 6,
        "bedrooms": 3,
        "beds": 3,
        "bathrooms": 3,
        "lat": 18.64,
        "lng": 72.87,
        "amenities": ["WiFi", "Kitchen", "Air conditioning", "Free parking", "Beach access", "Pet friendly"],
        "images": [
            unsplash("1499793983690-e29da59ef1c2"),
            unsplash("1512917774080-9991f1c4c750"),
            unsplash("1600047509807-ba8f99d2cdde"),
            unsplash("1600607688969-a5bfcd646154"),
            unsplash("1600566753190-17f0baa2a6c3"),
        ],
    },
    {
        "title": "Tea-estate cottage with valley deck",
        "description": "This independent cottage sits inside a working tea estate with misty valley views from every room. Slow mornings include estate walks and local breakfast; evenings are best spent on the timber deck with a book and a pot of fresh tea.",
        "location": "Munnar, Kerala",
        "property_type": "Cottage",
        "price": 5600,
        "cleaning": 650,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "lat": 10.09,
        "lng": 77.06,
        "amenities": ["WiFi", "Kitchen", "Free parking", "Mountain view", "Breakfast"],
        "images": [
            unsplash("1470252649378-9c29740c9fa8"),
            unsplash("1500530855697-b586d89ba3ee"),
            unsplash("1501785888041-af3ef285b470"),
            unsplash("1470770841072-f978cf4d019e"),
            unsplash("1441974231531-c6227db76b6e"),
        ],
    },
    {
        "title": "Luxury desert dome under the stars",
        "description": "A climate-controlled geodesic dome on the edge of the Thar Desert, complete with a private bathroom, sunset deck, and guided stargazing. Dinner and breakfast can be served outdoors, surrounded by dunes and near-total silence.",
        "location": "Jaisalmer, Rajasthan",
        "property_type": "Dome",
        "price": 7200,
        "cleaning": 750,
        "guests": 2,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "lat": 26.92,
        "lng": 70.91,
        "amenities": ["Air conditioning", "Free parking", "Breakfast", "Hot tub"],
        "images": [
            unsplash("1500534623283-312aade485b7"),
            unsplash("1534796636912-3b95b3ab5986"),
            unsplash("1500534314209-a25ddb2bd429"),
            unsplash("1519681393784-d120267933ba"),
            unsplash("1483347756197-71ef80e95f73"),
        ],
    },
    {
        "title": "Riverside bungalow near the yoga district",
        "description": "A peaceful bungalow overlooking the Ganga with a spacious balcony, airy rooms, and easy walking access to cafes and yoga studios. The home includes a practical kitchen, fast WiFi, and a small library for unhurried stays.",
        "location": "Rishikesh, Uttarakhand",
        "property_type": "Bungalow",
        "price": 4800,
        "cleaning": 600,
        "guests": 5,
        "bedrooms": 2,
        "beds": 3,
        "bathrooms": 2,
        "lat": 30.09,
        "lng": 78.27,
        "amenities": ["WiFi", "Kitchen", "Free parking", "Dedicated workspace", "Mountain view"],
        "images": [
            unsplash("1473445361085-b9a07f55608b"),
            unsplash("1469474968028-56623f02e42e"),
            unsplash("1500534623283-312aade485b7"),
            unsplash("1448375240586-882707db888b"),
            unsplash("1501854140801-50d01698950b"),
        ],
    },
    {
        "title": "French-quarter studio with rooftop terrace",
        "description": "A compact, character-filled studio behind the pastel facades of White Town. Original tile floors, high ceilings, and a shared rooftop terrace create a relaxed Pondicherry stay just a short walk from the promenade.",
        "location": "Pondicherry",
        "property_type": "Studio",
        "price": 3900,
        "cleaning": 500,
        "guests": 2,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1,
        "lat": 11.93,
        "lng": 79.83,
        "amenities": ["WiFi", "Kitchen", "Air conditioning", "Dedicated workspace"],
        "images": [
            unsplash("1505693416388-ac5ce068fe85"),
            unsplash("1524758631624-e2822e304c36"),
            unsplash("1497366811353-6870744d04b2"),
            unsplash("1494438639946-1ebd1d20bf85"),
            unsplash("1497215728101-856f4ea42174"),
        ],
    },
    {
        "title": "Traditional cedar houseboat on Dal Lake",
        "description": "A carved cedar houseboat with lake-facing bedrooms, a private sitting deck, and attentive local hosts. Breakfast is included, and shikara transfers can be arranged from the nearest ghat.",
        "location": "Srinagar, Jammu & Kashmir",
        "property_type": "Houseboat",
        "price": 6700,
        "cleaning": 700,
        "guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2,
        "lat": 34.11,
        "lng": 74.87,
        "amenities": ["WiFi", "Breakfast", "Mountain view"],
        "images": [
            unsplash("1500530855697-b586d89ba3ee"),
            unsplash("1507525428034-b723cf961d3e"),
            unsplash("1501785888041-af3ef285b470"),
            unsplash("1470770841072-f978cf4d019e"),
            unsplash("1497250681960-ef046c08a56e"),
        ],
    },
    {
        "title": "Canopy treehouse with outdoor rain shower",
        "description": "An elevated timber treehouse surrounded by dense Wayanad forest. Floor-to-ceiling windows bring the canopy indoors, while the covered deck and outdoor rain shower turn monsoon weather into part of the experience.",
        "location": "Wayanad, Kerala",
        "property_type": "Treehouse",
        "price": 8300,
        "cleaning": 850,
        "guests": 3,
        "bedrooms": 1,
        "beds": 2,
        "bathrooms": 1,
        "lat": 11.69,
        "lng": 76.13,
        "amenities": ["WiFi", "Free parking", "Breakfast", "Mountain view", "Hot tub"],
        "images": [
            unsplash("1520250497591-112f2f40a3f4"),
            unsplash("1510798831971-661eb04b3739"),
            unsplash("1505691938895-1758d7feb511"),
            unsplash("1486911278844-a81c5267e227"),
            unsplash("1520637836862-4d197d17c90a"),
        ],
    },
    {
        "title": "High-floor city loft with harbour view",
        "description": "A sophisticated loft with a wide harbour-facing window, open kitchen, and thoughtful workspace. The building has 24-hour security and places you close to galleries, restaurants, and the waterfront.",
        "location": "Mumbai, Maharashtra",
        "property_type": "Loft",
        "price": 8900,
        "cleaning": 950,
        "guests": 3,
        "bedrooms": 1,
        "beds": 2,
        "bathrooms": 1.5,
        "lat": 18.92,
        "lng": 72.83,
        "amenities": ["WiFi", "Kitchen", "Air conditioning", "Dedicated workspace", "Washer"],
        "images": [
            unsplash("1501183638710-841dd1904471"),
            unsplash("1502005097973-6a7082348e28"),
            unsplash("1505693416388-ac5ce068fe85"),
            unsplash("1493663284031-b7e3aefcae8e"),
            unsplash("1484101403633-562f891dc89a"),
        ],
    },
]


def seed_database(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    guest = User(
        name="Sonu Guest",
        email="sonu.guest@example.com",
        role="guest",
        avatar_url="https://i.pravatar.cc/160?img=47",
    )
    host_maya = User(
        name="Maya Kapoor",
        email="maya.host@example.com",
        role="host",
        is_superhost=True,
        avatar_url="https://i.pravatar.cc/160?img=32",
    )
    host_arjun = User(
        name="Arjun Mehta",
        email="arjun.host@example.com",
        role="host",
        is_superhost=False,
        avatar_url="https://i.pravatar.cc/160?img=12",
    )
    reviewer = User(
        name="Naina Sharma",
        email="naina@example.com",
        role="guest",
        avatar_url="https://i.pravatar.cc/160?img=25",
    )
    db.add_all([guest, host_maya, host_arjun, reviewer])
    db.flush()

    amenity_by_name: dict[str, Amenity] = {}
    for name, icon in AMENITIES:
        amenity = Amenity(name=name, icon=icon)
        db.add(amenity)
        amenity_by_name[name] = amenity
    db.flush()

    created_listings: list[Listing] = []
    for index, payload in enumerate(LISTINGS):
        listing = Listing(
            host_id=host_maya.id if index < 7 else host_arjun.id,
            title=payload["title"],
            description=payload["description"],
            location=payload["location"],
            country="India",
            property_type=payload["property_type"],
            price_per_night=payload["price"],
            cleaning_fee=payload["cleaning"],
            max_guests=payload["guests"],
            bedrooms=payload["bedrooms"],
            beds=payload["beds"],
            bathrooms=payload["bathrooms"],
            latitude=payload["lat"],
            longitude=payload["lng"],
            instant_book=index % 4 != 0,
        )
        listing.amenities = [amenity_by_name[name] for name in payload["amenities"]]
        listing.images = [
            ListingImage(url=url, alt_text=f"{payload['title']} photo {photo_index + 1}", sort_order=photo_index)
            for photo_index, url in enumerate(payload["images"])
        ]
        db.add(listing)
        created_listings.append(listing)
    db.flush()

    review_templates = [
        (guest, 4.9, "Beautifully designed and exactly as shown. Check-in was smooth and the host shared excellent local recommendations."),
        (reviewer, 4.7, "The space was spotless, peaceful, and thoughtfully equipped. I would happily stay here again."),
    ]
    for index, listing in enumerate(created_listings):
        first_author, first_rating, first_comment = review_templates[index % len(review_templates)]
        second_author, second_rating, second_comment = review_templates[(index + 1) % len(review_templates)]
        db.add_all(
            [
                Review(listing_id=listing.id, author_id=first_author.id, rating=first_rating, comment=first_comment),
                Review(listing_id=listing.id, author_id=second_author.id, rating=second_rating, comment=second_comment),
            ]
        )

    today = date.today()
    booking_specs = [
        (created_listings[0], today + timedelta(days=18), today + timedelta(days=22), 2),
        (created_listings[1], today + timedelta(days=30), today + timedelta(days=34), 3),
        (created_listings[3], today + timedelta(days=10), today + timedelta(days=13), 1),
    ]
    for number, (listing, check_in, check_out, guests) in enumerate(booking_specs, start=1):
        nights = (check_out - check_in).days
        nightly_total = listing.price_per_night * nights
        service_fee = round(nightly_total * 0.12, 2)
        taxes = round((nightly_total + listing.cleaning_fee + service_fee) * 0.08, 2)
        total = round(nightly_total + listing.cleaning_fee + service_fee + taxes, 2)
        db.add(
            Booking(
                listing_id=listing.id,
                guest_id=guest.id,
                check_in=check_in,
                check_out=check_out,
                guests=guests,
                nightly_total=nightly_total,
                cleaning_fee=listing.cleaning_fee,
                service_fee=service_fee,
                taxes=taxes,
                total_price=total,
                status="confirmed",
                confirmation_code=f"STAY-SEED-{number:03d}",
            )
        )

    db.commit()
