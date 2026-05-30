from sqlalchemy import Column, Float, ForeignKey, Integer, String, Table, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base

procedure_relations = Table(
    "procedure_relations",
    Base.metadata,
    Column("procedure_id", Integer, ForeignKey("procedures.id", ondelete="CASCADE"), primary_key=True),
    Column(
        "related_procedure_id",
        Integer,
        ForeignKey("procedures.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(220), unique=True, nullable=False, index=True)
    description = Column(Text, default="")
    location = Column(String(200), default="")
    county = Column(String(100), default="Nairobi")
    tier = Column(String(50), default="Level 5")  # Level 4, Level 5, private
    ownership = Column(String(50), default="private")  # government | private | faith-based
    rating = Column(Float, default=4.0)
    review_count = Column(Integer, default=0)
    image_url = Column(String(500), default="")

    services = relationship("HospitalService", back_populates="hospital", cascade="all, delete-orphan")
    equipment_links = relationship("HospitalEquipment", back_populates="hospital", cascade="all, delete-orphan")
    insurance_links = relationship("HospitalInsurance", back_populates="hospital", cascade="all, delete-orphan")


class Procedure(Base):
    __tablename__ = "procedures"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(220), unique=True, nullable=False, index=True)
    description = Column(Text, default="")
    category = Column(String(100), default="General")

    services = relationship("HospitalService", back_populates="procedure", cascade="all, delete-orphan")
    synonyms = relationship("ProcedureSynonym", back_populates="procedure", cascade="all, delete-orphan")
    related = relationship(
        "Procedure",
        secondary=procedure_relations,
        primaryjoin=id == procedure_relations.c.procedure_id,
        secondaryjoin=id == procedure_relations.c.related_procedure_id,
    )


class ProcedureSynonym(Base):
    __tablename__ = "procedure_synonyms"

    id = Column(Integer, primary_key=True)
    procedure_id = Column(Integer, ForeignKey("procedures.id", ondelete="CASCADE"), nullable=False)
    synonym = Column(String(200), nullable=False, index=True)

    procedure = relationship("Procedure", back_populates="synonyms")


class HospitalService(Base):
    __tablename__ = "hospital_services"
    __table_args__ = (UniqueConstraint("hospital_id", "procedure_id", name="uq_hospital_procedure"),)

    id = Column(Integer, primary_key=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    procedure_id = Column(Integer, ForeignKey("procedures.id", ondelete="CASCADE"), nullable=False, index=True)
    price_min = Column(Integer, nullable=False)
    price_max = Column(Integer, nullable=False)
    currency = Column(String(10), default="KES")
    notes = Column(Text, default="")

    hospital = relationship("Hospital", back_populates="services")
    procedure = relationship("Procedure", back_populates="services")


class InsuranceProvider(Base):
    __tablename__ = "insurance_providers"

    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False, unique=True)
    slug = Column(String(170), unique=True, nullable=False)
    logo_url = Column(String(500), default="")

    hospital_links = relationship("HospitalInsurance", back_populates="insurance", cascade="all, delete-orphan")


class HospitalInsurance(Base):
    __tablename__ = "hospital_insurance"
    __table_args__ = (UniqueConstraint("hospital_id", "insurance_id", name="uq_hospital_insurance"),)

    id = Column(Integer, primary_key=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    insurance_id = Column(Integer, ForeignKey("insurance_providers.id", ondelete="CASCADE"), nullable=False)

    hospital = relationship("Hospital", back_populates="insurance_links")
    insurance = relationship("InsuranceProvider", back_populates="hospital_links")


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False, unique=True)
    slug = Column(String(170), unique=True, nullable=False)

    hospital_links = relationship("HospitalEquipment", back_populates="equipment", cascade="all, delete-orphan")


class HospitalEquipment(Base):
    __tablename__ = "hospital_equipment"
    __table_args__ = (UniqueConstraint("hospital_id", "equipment_id", name="uq_hospital_equipment"),)

    id = Column(Integer, primary_key=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    equipment_id = Column(Integer, ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False)

    hospital = relationship("Hospital", back_populates="equipment_links")
    equipment = relationship("Equipment", back_populates="hospital_links")
