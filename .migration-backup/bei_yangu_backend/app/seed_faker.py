"""Populate the database with realistic Kenyan healthcare data."""

from __future__ import annotations

import random
import re
from typing import Any

from faker import Faker
from sqlalchemy.orm import Session

from app.models import (
    Equipment,
    Hospital,
    HospitalEquipment,
    HospitalInsurance,
    HospitalService,
    InsuranceProvider,
    Procedure,
    ProcedureSynonym,
    procedure_relations,
)

# Faker used only for minor text variety; all geography & hospitals are Kenya-specific.
fake = Faker("en_GB")
Faker.seed(254)
random.seed(254)

# --- Kenyan insurers (market names patients recognise) ---

INSURERS = [
    ("NHIF / Social Health Authority (SHA)", "nhif"),
    ("Jubilee Health Insurance", "jubilee"),
    ("AAR Insurance Kenya", "aar"),
    ("Britam Insurance", "britam"),
    ("Madison General Insurance Kenya", "madison"),
    ("CIC Group", "cic"),
    ("APA Insurance", "apa"),
    ("UAP Old Mutual", "uap"),
    ("Resolution Health East Africa", "resolution"),
    ("Heritage Insurance Company", "heritage"),
    ("Kenindia Assurance", "kenindia"),
    ("First Assurance", "first-assurance"),
    ("GA Insurance", "ga-insurance"),
    ("Sanlam Kenya", "sanlam"),
    ("ICEA LION Group", "icea-lion"),
]

EQUIPMENT = [
    ("MRI Machine", "mri"),
    ("CT Scanner", "ct-scanner"),
    ("Digital X-Ray", "xray"),
    ("Ultrasound", "ultrasound"),
    ("NICU", "nicu"),
    ("Operating Theatre", "operating-theatre"),
    ("Dialysis Unit", "dialysis"),
    ("Cardiac Catheterization Lab", "cath-lab"),
    ("Laboratory (PCR)", "lab-pcr"),
    ("Ambulance / EMS", "ambulance"),
]

# County → typical towns / estates for location strings
COUNTY_AREAS: dict[str, list[str]] = {
    "Nairobi": [
        "Upper Hill", "Westlands", "South B", "South C", "Buruburu", "Hurlingham",
        "Muthaiga", "Kilimani", "Parklands", "CBD", "Eastleigh", "Kasarani",
        "Embakasi", "Karen", "Ruaraka", "Ngong Road", "Lavington", "Rongai",
    ],
    "Mombasa": ["Nyali", "Bamburi", "Likoni", "Tononoka", "Mombasa Island", "Shanzu", "Bombolulu"],
    "Kisumu": ["Kisumu Central", "Milimani", "Kondele", "Manyatta", "Nyalenda"],
    "Nakuru": ["Nakuru Town", "Section 58", "London", "Pipeline", "Shabab"],
    "Kiambu": ["Thika", "Ruiru", "Kikuyu", "Limuru", "Kiambu Town", "Kahawa", "Githurai"],
    "Uasin Gishu": ["Eldoret Town", "Langas", "Huruma", "Pioneer"],
    "Machakos": ["Machakos Town", "Athi River", "Syokimau", "Mlolongo"],
    "Kajiado": ["Kitengela", "Ngong", "Ongata Rongai", "Kajiado Town"],
    "Nyeri": ["Nyeri Town", "Karatina", "Othaya"],
    "Kilifi": ["Kilifi Town", "Malindi", "Watamu", "Mtwapa"],
    "Kakamega": ["Kakamega Town", "Mumias", "Shinyalu"],
    "Bomet": ["Bomet Town", "Tenwek", "Sotik"],
    "Meru": ["Meru Town", "Maua", "Nkubu"],
    "Embu": ["Embu Town", "Runyenjes"],
    "Garissa": ["Garissa Town"],
    "Turkana": ["Lodwar"],
    "Nandi": ["Kapsabet", "Nandi Hills"],
    "Bungoma": ["Bungoma Town", "Webuye"],
    "Murang'a": ["Murang'a Town", "Kangema"],
    "Laikipia": ["Nanyuki", "Nyahururu"],
    "Migori": ["Migori Town", "Rongo", "Kehancha"],
    "Kericho": ["Kericho Town", "Litein", "Bureti"],
}

# Real Kenyan hospitals — public referral, faith-based missions, and major private chains
KENYAN_HOSPITALS: list[dict[str, Any]] = [
    # National & county referral (government)
    {"name": "Kenyatta National Hospital", "ownership": "government", "tier": "Level 6", "county": "Nairobi", "area": "Upper Hill"},
    {"name": "Kenyatta University Teaching, Referral & Research Hospital", "ownership": "government", "tier": "Level 6", "county": "Kiambu", "area": "Kahawa"},
    {"name": "Moi Teaching and Referral Hospital", "ownership": "government", "tier": "Level 6", "county": "Uasin Gishu", "area": "Eldoret Town"},
    {"name": "Coast General Teaching and Referral Hospital", "ownership": "government", "tier": "Level 5", "county": "Mombasa", "area": "Tononoka"},
    {"name": "Kisumu County Referral Hospital", "ownership": "government", "tier": "Level 5", "county": "Kisumu", "area": "Kisumu Central"},
    {"name": "Jaramogi Oginga Odinga Teaching & Referral Hospital", "ownership": "government", "tier": "Level 5", "county": "Kisumu", "area": "Kisumu"},
    {"name": "Nakuru County Referral Hospital", "ownership": "government", "tier": "Level 5", "county": "Nakuru", "area": "Nakuru Town"},
    {"name": "Machakos Level 5 Hospital", "ownership": "government", "tier": "Level 5", "county": "Machakos", "area": "Machakos Town"},
    {"name": "Thika Level 5 Hospital", "ownership": "government", "tier": "Level 5", "county": "Kiambu", "area": "Thika"},
    {"name": "Kakamega County General Teaching & Referral Hospital", "ownership": "government", "tier": "Level 5", "county": "Kakamega", "area": "Kakamega Town"},
    {"name": "Meru Teaching and Referral Hospital", "ownership": "government", "tier": "Level 5", "county": "Meru", "area": "Meru Town"},
    {"name": "Embu County Referral Hospital", "ownership": "government", "tier": "Level 5", "county": "Embu", "area": "Embu Town"},
    {"name": "Garissa County Referral Hospital", "ownership": "government", "tier": "Level 5", "county": "Garissa", "area": "Garissa Town"},
    {"name": "Lodwar County & Referral Hospital", "ownership": "government", "tier": "Level 5", "county": "Turkana", "area": "Lodwar"},
    {"name": "Mama Lucy Kibaki Hospital", "ownership": "government", "tier": "Level 4", "county": "Nairobi", "area": "Embakasi"},
    {"name": "Mbagathi County Hospital", "ownership": "government", "tier": "Level 4", "county": "Nairobi", "area": "Mbagathi Way"},
    {"name": "Pumwani Maternity Hospital", "ownership": "government", "tier": "Level 4", "county": "Nairobi", "area": "Pumwani"},
    {"name": "Mathari National Teaching & Referral Hospital", "ownership": "government", "tier": "Level 5", "county": "Nairobi", "area": "Mathari"},
    # Major private — Nairobi & nationwide brands
    {"name": "The Nairobi Hospital", "ownership": "private", "tier": "Level 6", "county": "Nairobi", "area": "CBD"},
    {"name": "Aga Khan University Hospital Nairobi", "ownership": "faith-based", "tier": "Level 6", "county": "Nairobi", "area": "South C"},
    {"name": "Metropolitan Hospital", "ownership": "private", "tier": "Level 5", "county": "Nairobi", "area": "Buruburu"},
    {"name": "MP Shah Hospital", "ownership": "private", "tier": "Level 5", "county": "Nairobi", "area": "Parklands"},
    {"name": "Nairobi Women's Hospital", "ownership": "private", "tier": "Level 5", "county": "Nairobi", "area": "Hurlingham"},
    {"name": "Gertrude's Children's Hospital", "ownership": "private", "tier": "Level 5", "county": "Nairobi", "area": "Muthaiga"},
    {"name": "Karen Hospital", "ownership": "private", "tier": "Level 5", "county": "Nairobi", "area": "Karen"},
    {"name": "Avenue Hospital", "ownership": "private", "tier": "Level 4", "county": "Nairobi", "area": "Parklands"},
    {"name": "Nairobi West Hospital", "ownership": "private", "tier": "Level 4", "county": "Nairobi", "area": "South C"},
    {"name": "RFH Healthcare", "ownership": "private", "tier": "Level 4", "county": "Nairobi", "area": "Westlands"},
    {"name": "Nairobi South Hospital", "ownership": "private", "tier": "Level 4", "county": "Nairobi", "area": "South C"},
    {"name": "Parklands Kidney Centre", "ownership": "private", "tier": "Level 4", "county": "Nairobi", "area": "Parklands"},
    {"name": "Mombasa Hospital", "ownership": "private", "tier": "Level 5", "county": "Mombasa", "area": "Nyali"},
    {"name": "Aga Khan Hospital Mombasa", "ownership": "faith-based", "tier": "Level 5", "county": "Mombasa", "area": "Mombasa Island"},
    {"name": "Aga Khan Hospital Kisumu", "ownership": "faith-based", "tier": "Level 5", "county": "Kisumu", "area": "Kisumu Central"},
    {"name": "Aga Khan Hospital Nakuru", "ownership": "faith-based", "tier": "Level 5", "county": "Nakuru", "area": "Nakuru Town"},
    {"name": "Plainsview Hospital", "ownership": "private", "tier": "Level 4", "county": "Nairobi", "area": "Ruaraka"},
    {"name": "Kisumu Specialist Hospital", "ownership": "private", "tier": "Level 4", "county": "Kisumu", "area": "Milimani"},
    # Faith-based / mission hospitals (very common in Kenya)
    {"name": "Mater Misericordiae Hospital", "ownership": "faith-based", "tier": "Level 5", "county": "Nairobi", "area": "South B"},
    {"name": "Coptic Hospital Nairobi", "ownership": "faith-based", "tier": "Level 4", "county": "Nairobi", "area": "Nairobi West"},
    {"name": "St. Mary's Mission Hospital Langata", "ownership": "faith-based", "tier": "Level 4", "county": "Nairobi", "area": "Langata"},
    {"name": "PCEA Kikuyu Hospital", "ownership": "faith-based", "tier": "Level 4", "county": "Kiambu", "area": "Kikuyu"},
    {"name": "Tenwek Hospital", "ownership": "faith-based", "tier": "Level 4", "county": "Bomet", "area": "Tenwek"},
    {"name": "Kijabe Hospital", "ownership": "faith-based", "tier": "Level 5", "county": "Kiambu", "area": "Kijabe"},
    {"name": "AIC Kijabe Hospital", "ownership": "faith-based", "tier": "Level 5", "county": "Kiambu", "area": "Kijabe"},
    {"name": "St. Camillus Hospital Karungu", "ownership": "faith-based", "tier": "Level 4", "county": "Migori", "area": "Karungu"},
    {"name": "Consolata Hospital Nyeri", "ownership": "faith-based", "tier": "Level 4", "county": "Nyeri", "area": "Nyeri Town"},
    {"name": "St. Joseph's Mission Hospital", "ownership": "faith-based", "tier": "Level 4", "county": "Machakos", "area": "Machakos Town"},
    # Additional county & community facilities
    {"name": "Nyeri County Referral Hospital", "ownership": "government", "tier": "Level 5", "county": "Nyeri", "area": "Nyeri Town"},
    {"name": "Kilifi County Hospital", "ownership": "government", "tier": "Level 4", "county": "Kilifi", "area": "Kilifi Town"},
    {"name": "Malindi Sub-County Hospital", "ownership": "government", "tier": "Level 4", "county": "Kilifi", "area": "Malindi"},
    {"name": "Bungoma County Referral Hospital", "ownership": "government", "tier": "Level 5", "county": "Bungoma", "area": "Bungoma Town"},
    {"name": "Nanyuki Cottage Hospital", "ownership": "private", "tier": "Level 4", "county": "Laikipia", "area": "Nanyuki"},
    {"name": "AIC Litein Hospital", "ownership": "faith-based", "tier": "Level 4", "county": "Kericho", "area": "Litein"},
]

# Patterns for additional county-level facilities (no US company names)
EXTRA_HOSPITAL_PREFIXES = [
    "St. Joseph", "St. Mary", "St. Monica", "PCEA", "AIC", "Consolata",
    "Methodist", "Baptist", "Anglican", "Catholic", "Muslim",
]
EXTRA_HOSPITAL_SUFFIXES = [
    "Mission Hospital", "Sub-County Hospital", "County Hospital",
    "Health Centre", "Medical Centre", "Specialist Hospital",
]
EXTRA_TOWN_NAMES = [
    "Kitale", "Kericho", "Narok", "Homa Bay", "Siaya", "Busia", "Voi", "Wundanyi",
    "Isiolo", "Marsabit", "Moyale", "Mandera", "Wajir", "Kwale", "Lamu", "Hollywood" ,
]

# Remove typo Hollywood - use realistic
EXTRA_TOWN_NAMES = [t for t in EXTRA_TOWN_NAMES if t != "Hollywood"]

PROCEDURE_CATALOG: list[tuple[str, str, str, str, int]] = [
    ("testicular-exploration", "Testicular Exploration", "Urology", "Uchunguzi wa korodani — surgical scrotal exploration", 320_000),
    ("prostate-biopsy", "Prostate Biopsy", "Urology", "Sampuli ya prostate kwa uchunguzi wa saratani", 55_000),
    ("vasectomy", "Vasectomy", "Urology", "Male sterilisation (mpango wa uzazi wa kiume)", 35_000),
    ("normal-delivery", "Normal Delivery", "Maternity", "Kujifungua kawaida — vaginal birth na ward stay", 90_000),
    ("caesarean-section", "Caesarean Section", "Maternity", "Kujifungua kwa upasuaji (C-section)", 165_000),
    ("antenatal-package", "Antenatal Care Package", "Maternity", "ANC visits — clinic ya wajawazito", 28_000),
    ("appendectomy", "Appendectomy", "General Surgery", "Kuondoa appendix — appendicitis", 115_000),
    ("hernia-repair", "Inguinal Hernia Repair", "General Surgery", "Upasuaji wa hernia", 105_000),
    ("cholecystectomy", "Cholecystectomy", "General Surgery", "Kuondoa kibofu cha nyongo", 180_000),
    ("endoscopy", "Upper GI Endoscopy", "Gastroenterology", "Uchunguzi wa mfumo wa chakula juu", 32_000),
    ("colonoscopy", "Colonoscopy", "Gastroenterology", "Lower GI scope na sedation", 48_000),
    ("mri-scan", "MRI Scan", "Diagnostics", "Magnetic resonance — region moja", 28_000),
    ("ct-scan", "CT Scan", "Diagnostics", "CT scan na contrast ikiwa inahitajika", 20_000),
    ("chest-xray", "Chest X-Ray", "Diagnostics", "X-ray ya kifua", 3_500),
    ("ultrasound-abdominal", "Abdominal Ultrasound", "Diagnostics", "Ultrasound ya tumbo na pelvic", 6_500),
    ("full-blood-count", "Full Haemogram", "Laboratory", "Kipimo cha damu kamili", 2_200),
    ("malaria-test", "Malaria Rapid Test", "Laboratory", "RDT au microscopy — malaria", 1_200),
    ("typhoid-test", "Typhoid Test", "Laboratory", "Widal / blood culture kwa typhoid", 2_800),
    ("dental-cleaning", "Dental Cleaning & Polish", "Dental", "Kusafisha meno — scaling", 6_000),
    ("tooth-extraction", "Tooth Extraction", "Dental", "Kung'oa jino", 8_500),
    ("cataract-surgery", "Cataract Surgery", "Ophthalmology", "Upasuaji wa cataract — jicho moja", 95_000),
    ("glaucoma-review", "Glaucoma Screening", "Ophthalmology", "Uchunguzi wa glaucoma", 12_000),
    ("dialysis-session", "Haemodialysis Session", "Renal", "Dialysis session moja", 18_000),
    ("physiotherapy-session", "Physiotherapy Session", "Rehabilitation", "Physio outpatient — dakika 45", 4_500),
    ("orthopaedic-consult", "Orthopaedic Consultation", "Orthopaedics", "Ushauri wa daktari wa mifupa", 5_500),
    ("knee-arthroscopy", "Knee Arthroscopy", "Orthopaedics", "Scope ya goti", 220_000),
    ("chemotherapy-cycle", "Chemotherapy Cycle", "Oncology", "Chemo cycle moja (dawa ziada)", 85_000),
    ("pap-smear", "Pap Smear", "Gynaecology", "Uchunguzi wa shingo ya kizazi", 4_800),
    ("family-planning-implant", "Contraceptive Implant", "Gynaecology", "Implant ya uzazi wa mpango", 12_000),
    ("paediatric-review", "Paediatric Specialist Review", "Paediatrics", "Ushauri wa mtoto chini ya miaka 12", 4_200),
    ("immunisation-package", "Child Immunisation Package", "Paediatrics", "Chanjo za WHO — mtoto", 15_000),
    ("hiv-test", "HIV Rapid Test", "Laboratory", "Ushauri na kipimo cha VCT", 800),
    ("ecg", "Electrocardiogram (ECG)", "Cardiology", "ECG ya mstari 12", 3_000),
    ("echo-cardiogram", "Echocardiogram", "Cardiology", "Ultrasound ya moyo", 18_000),
    ("circumcision", "Medical Circumcision", "General Surgery", "Tohara ya kimedical — VMMC", 12_000),
    ("snake-bite-treatment", "Snake Bite Initial Care", "Emergency", "Antivenom & stabilisation — hatua ya kwanza", 45_000),
]

SYNONYMS: dict[str, list[str]] = {
    "testicular-exploration": ["testicle surgery", "korodani", "scrotal exploration", "urology exploration"],
    "prostate-biopsy": ["prostate cancer test", "psa biopsy", "saratani ya prostate"],
    "normal-delivery": [
        "childbirth", "kujifungua", "kuzaa", "giving birth", "delivery",
        "birth cost kenya", "bei ya kuzaa", "hospital delivery price",
    ],
    "caesarean-section": ["c-section", "cs", "caesarean", "kujifungua kwa upasuaji"],
    "appendectomy": ["appendix", "appendicitis", "kuondoa appendix"],
    "hernia-repair": ["hernia", "upasuaji wa hernia"],
    "malaria-test": ["malaria", "kipimo cha malaria", "RDT"],
    "hiv-test": ["VCT", "kipimo cha ukimwi", "HIV"],
    "circumcision": ["tohara", "VMMC", "medical circumcision"],
    "mri-scan": ["MRI", "magnetic resonance"],
    "immunisation-package": ["chanjo", "vaccination", "child vaccines"],
}

RELATIONS = [
    ("testicular-exploration", "prostate-biopsy"),
    ("normal-delivery", "caesarean-section"),
    ("normal-delivery", "antenatal-package"),
    ("appendectomy", "hernia-repair"),
    ("mri-scan", "ct-scan"),
    ("colonoscopy", "endoscopy"),
    ("cataract-surgery", "glaucoma-review"),
    ("malaria-test", "full-blood-count"),
]

OWNERSHIP_PRICE_FACTOR = {
    "government": (0.25, 0.42),
    "faith-based": (0.68, 0.85),
    "private": (1.0, 1.32),
}

TIER_EQUIPMENT = {
    "Level 6": {"mri", "ct-scanner", "cath-lab", "nicu", "dialysis", "lab-pcr", "operating-theatre"},
    "Level 5": {"ct-scanner", "operating-theatre", "ultrasound", "nicu", "xray", "ambulance"},
    "Level 4": {"operating-theatre", "ultrasound", "xray", "ambulance"},
}

KENYAN_NOTE_TEMPLATES = [
    "NHIF/SHA rebate inaweza kutumika kwa wanachama waliosajiliwa.",
    "Bei haijumuishi implants — uliza hospitali kabla ya admission.",
    "Deposit kwa M-Pesa au bank inaweza kuhitajika (kawaida 30–50%).",
    "Bei za emergency baada ya saa 5 inaweza kuongezeka.",
    "Ufunguzi wa file na consultation zimemo ndani ya range.",
    "Ward stay ya usiku {n} inaweza kujumuishwa — thibitisha na facility.",
    "Insurance pre-auth inapendekezwa kwa Jubilee, AAR, Britam.",
    "Bei kwa wagonjwa wa county nje ya Nairobi inaweza kutofautiana kidogo.",
]

PACKAGE_NOTES = {
    "Maternity": [
        "Maternity package — antenatal classes optional.",
        "Deposit ya kawaida KES 20,000–50,000 kwa hospitali za kibinafsi Nairobi.",
        "Pumwani na KNH ni chaguo za uma kwa bei ya chini.",
    ],
    "Urology": ["Surgeon fee included; anaesthesia billed separately at some sites."],
    "Oncology": ["Dawa za chemo ziwezekane kuongezeka — oncologist fee included."],
    "Emergency": ["Snake antivenom availability varies — call facility first."],
}


def slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")


def clear_database(db: Session) -> None:
    db.execute(procedure_relations.delete())
    db.query(HospitalService).delete()
    db.query(HospitalEquipment).delete()
    db.query(HospitalInsurance).delete()
    db.query(ProcedureSynonym).delete()
    db.query(Hospital).delete()
    db.query(Procedure).delete()
    db.query(InsuranceProvider).delete()
    db.query(Equipment).delete()
    db.commit()


def _price_range(base: int, ownership: str, tier: str, county: str) -> tuple[int, int]:
    lo_f, hi_f = OWNERSHIP_PRICE_FACTOR.get(ownership, (0.9, 1.1))
    tier_adj = {"Level 6": 1.1, "Level 5": 1.0, "Level 4": 0.86}.get(tier, 1.0)
    county_adj = 1.0 if county == "Nairobi" else random.uniform(0.78, 0.94)
    jitter = random.uniform(0.94, 1.06)
    mid = base * tier_adj * county_adj * jitter
    pmin = max(500, int(mid * lo_f))
    pmax = int(mid * hi_f * random.uniform(1.05, 1.2))
    if pmax <= pmin:
        pmax = int(pmin * random.uniform(1.12, 1.35))
    pmin = round(pmin / 500) * 500
    pmax = round(pmax / 500) * 500
    return pmin, pmax


def _hospital_rating(ownership: str, tier: str) -> tuple[float, int]:
    base = {"government": 3.6, "faith-based": 4.1, "private": 4.3}.get(ownership, 4.0)
    tier_b = {"Level 6": 0.3, "Level 5": 0.15, "Level 4": 0.0}.get(tier, 0)
    rating = round(min(5.0, max(3.1, base + tier_b + random.uniform(-0.25, 0.3))), 1)
    reviews = {
        "government": random.randint(350, 2200),
        "faith-based": random.randint(60, 420),
        "private": random.randint(40, 350),
    }[ownership]
    return rating, reviews


def _kenyan_hospital_description(tpl: dict[str, Any]) -> str:
    county = tpl["county"]
    ownership = tpl["ownership"]
    tier = tpl["tier"]
    lines = [
        f"{tpl['name']} ni hospitali ya {tier} katika kaunti ya {county}, Kenya.",
        f"Eneo: {tpl['area']}, {county}.",
    ]
    if ownership == "government":
        lines.append(
            "Hospitali ya uma — NHIF/SHA inakubaliwa kwa wanachama walio na cover. "
            "Bei za umma kwa wagonjwa wengi ni za chini ikilinganishwa na sekta ya kibinafsi."
        )
    elif ownership == "faith-based":
        lines.append(
            "Hospitali ya dini/mission — huduma za jamii na outreach. "
            "Inakubali NHIF pamoja na bima za kibinafsi kama Jubilee na AAR."
        )
    else:
        lines.append(
            "Hospitali ya kibinafsi — appointment na emergency. "
            "Lipa kwa M-Pesa, insurance, au cash; deposit inaweza kuhitajika kabla ya admission."
        )
    if random.random() < 0.35:
        lines.append(fake.sentence(nb_words=12))
    return " ".join(lines)


def _generate_kenyan_extra_hospitals(count: int) -> list[dict[str, Any]]:
    """Generate plausible Kenyan county / mission facility names."""
    extras: list[dict[str, Any]] = []
    counties = list(COUNTY_AREAS.keys())
    used_names: set[str] = {h["name"] for h in KENYAN_HOSPITALS}

    for _ in range(count):
        county = random.choice(counties)
        areas = COUNTY_AREAS.get(county, [county])
        area = random.choice(areas)
        ownership = random.choices(
            ["government", "faith-based", "private"],
            weights=[0.45, 0.35, 0.20],
        )[0]
        tier = random.choices(
            ["Level 4", "Level 5", "Level 4"],
            weights=[0.5, 0.35, 0.15],
        )[0]

        if ownership == "government":
            name = f"{county} County Referral Hospital" if random.random() < 0.4 else (
                f"{area} Sub-County Hospital"
            )
        else:
            town = random.choice(EXTRA_TOWN_NAMES + [area, county])
            prefix = random.choice(EXTRA_HOSPITAL_PREFIXES)
            suffix = random.choice(EXTRA_HOSPITAL_SUFFIXES)
            name = f"{prefix} {town} {suffix}"

        if name in used_names:
            name = f"{name} ({area})"
        used_names.add(name)

        extras.append({
            "name": name[:120],
            "ownership": ownership,
            "tier": tier,
            "county": county,
            "area": area,
        })
    return extras


def _service_note(category: str) -> str:
    if category in PACKAGE_NOTES and random.random() < 0.6:
        return random.choice(PACKAGE_NOTES[category])
    if random.random() < 0.45:
        return random.choice(KENYAN_NOTE_TEMPLATES).format(n=random.randint(1, 5))
    return ""


def _assign_equipment(
    db: Session,
    hospital: Hospital,
    eq_map: dict[str, Equipment],
) -> None:
    assigned: set[int] = set()
    tier_eq = set(TIER_EQUIPMENT.get(hospital.tier, {"xray", "ultrasound"}))
    for eq_slug in tier_eq:
        if eq_slug in eq_map and eq_map[eq_slug].id not in assigned:
            db.add(HospitalEquipment(hospital_id=hospital.id, equipment_id=eq_map[eq_slug].id))
            assigned.add(eq_map[eq_slug].id)
    if hospital.ownership == "private" and random.random() < 0.4:
        for extra in random.sample(["dialysis", "cath-lab", "ambulance", "mri"], k=1):
            if extra in eq_map and eq_map[extra].id not in assigned:
                db.add(HospitalEquipment(hospital_id=hospital.id, equipment_id=eq_map[extra].id))
                assigned.add(eq_map[extra].id)


def _assign_insurance(
    db: Session,
    hospital: Hospital,
    ins_map: dict[str, InsuranceProvider],
) -> None:
    assigned: set[int] = set()
    nhif = ins_map["nhif"]
    db.add(HospitalInsurance(hospital_id=hospital.id, insurance_id=nhif.id))
    assigned.add(nhif.id)
    pool = [s for s in ins_map if s != "nhif"]
    n_ins = random.randint(2, 5) if hospital.ownership != "government" else random.randint(1, 3)
    for slug in random.sample(pool, min(n_ins, len(pool))):
        ins_id = ins_map[slug].id
        if ins_id not in assigned:
            db.add(HospitalInsurance(hospital_id=hospital.id, insurance_id=ins_id))
            assigned.add(ins_id)


def seed_with_faker(db: Session, *, extra_hospitals: int = 8) -> dict[str, int]:
    """Wipe and repopulate with Kenya-focused hospital & pricing data."""
    clear_database(db)

    insurers = [InsuranceProvider(name=n, slug=s) for n, s in INSURERS]
    db.add_all(insurers)
    equipment_list = [Equipment(name=n, slug=s) for n, s in EQUIPMENT]
    db.add_all(equipment_list)
    db.flush()

    procedures: dict[str, Procedure] = {}
    for slug, name, category, desc, _base in PROCEDURE_CATALOG:
        db.add(Procedure(name=name, slug=slug, category=category, description=desc))
    db.flush()
    for p in db.query(Procedure).all():
        procedures[p.slug] = p

    for slug, syns in SYNONYMS.items():
        if slug in procedures:
            for syn in syns:
                db.add(ProcedureSynonym(procedure_id=procedures[slug].id, synonym=syn))

    for a, b in RELATIONS:
        if a in procedures and b in procedures:
            db.execute(
                procedure_relations.insert().values(
                    procedure_id=procedures[a].id,
                    related_procedure_id=procedures[b].id,
                )
            )
            db.execute(
                procedure_relations.insert().values(
                    procedure_id=procedures[b].id,
                    related_procedure_id=procedures[a].id,
                )
            )

    all_templates = KENYAN_HOSPITALS + _generate_kenyan_extra_hospitals(extra_hospitals)
    seen_slugs: set[str] = set()
    hospitals: list[Hospital] = []

    for tpl in all_templates:
        base_slug = slugify(tpl["name"])
        slug = base_slug
        n = 2
        while slug in seen_slugs:
            slug = f"{base_slug}-{n}"
            n += 1
        seen_slugs.add(slug)

        rating, review_count = _hospital_rating(tpl["ownership"], tpl["tier"])
        hospital = Hospital(
            name=tpl["name"],
            slug=slug,
            description=_kenyan_hospital_description(tpl),
            location=f"{tpl['area']}, {tpl['county']}",
            county=tpl["county"],
            tier=tpl["tier"],
            ownership=tpl["ownership"],
            rating=rating,
            review_count=review_count,
            image_url="",
        )
        db.add(hospital)
        hospitals.append(hospital)

    db.flush()

    eq_map = {e.slug: e for e in equipment_list}
    ins_map = {i.slug: i for i in insurers}

    service_count = 0
    for hospital in hospitals:
        _assign_insurance(db, hospital, ins_map)
        _assign_equipment(db, hospital, eq_map)

        offer_ratio = random.uniform(0.58, 0.88)
        offered = random.sample(
            list(PROCEDURE_CATALOG),
            k=max(10, int(len(PROCEDURE_CATALOG) * offer_ratio)),
        )
        for slug, _name, category, _desc, base_price in offered:
            pmin, pmax = _price_range(base_price, hospital.ownership, hospital.tier, hospital.county)
            db.add(
                HospitalService(
                    hospital_id=hospital.id,
                    procedure_id=procedures[slug].id,
                    price_min=pmin,
                    price_max=pmax,
                    currency="KES",
                    notes=_service_note(category),
                )
            )
            service_count += 1

    db.commit()
    return {
        "hospitals": len(hospitals),
        "procedures": len(procedures),
        "services": service_count,
        "insurers": len(insurers),
        "equipment": len(equipment_list),
        "counties": len({h.county for h in hospitals}),
    }
