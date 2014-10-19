from peewee import *

db = PostgresqlDatabase('iati_data', threadlocals=True)

class BaseModel(Model):
    class Meta:
        database = db

class Activity(BaseModel):
    package_id = CharField(null=False)
    source_file = CharField(null=False)
    activity_lang = CharField(null=False)
    default_currency = CharField(null=False)
    hierarchy = CharField(null=False)
    last_updated = CharField(null=False)
    reporting_org = CharField(null=False)
    reporting_org_ref = CharField(null=False)
    reporting_org_type = CharField(null=False)
    funding_org = CharField(null=False)
    funding_org_ref = CharField(null=False)
    funding_org_type = CharField(null=False)
    extending_org = CharField(null=False)
    extending_org_ref = CharField(null=False)
    extending_org_type = CharField(null=False)
    implementing_org = CharField(null=False)
    implementing_org_ref = CharField(null=False)
    implementing_org_type = CharField(null=False)
    recipient_region = CharField(null=False)
    recipient_region_code = CharField(null=False)
    recipient_country = CharField(null=False)
    recipient_country_code = CharField(null=False)
    collaboration_type = CharField(null=False)
    collaboration_type_code = CharField(null=False)
    flow_type = CharField(null=False)
    flow_type_code = CharField(null=False)
    aid_type = CharField(null=False)
    aid_type_code = CharField(null=False)
    finance_type = CharField(null=False)
    finance_type_code = CharField(null=False)
    iati_identifier = CharField(null=False)
    title = CharField(null=False)
    description = CharField(null=False)
    date_start_actual = CharField(null=False)
    date_start_planned = CharField(null=False)
    date_end_actual = CharField(null=False)
    date_end_planned = CharField(null=False)
    status_code = CharField(null=False)
    status = CharField(null=False)
    contact_organisation = CharField(null=False)
    contact_telephone = CharField(null=False)
    contact_email = CharField(null=False)
    contact_mailing_address = CharField(null=False)
    tied_status = CharField(null=False)
    tied_status_code = CharField(null=False)
    activity_website = CharField(null=False)

    class Meta:
        db_table = 'activity'
        # indexes = ('iati_identifier',)

    def get_start(self):
        if self.date_start_actual:
            return self.date_start_actual
        return self.date_start_planned

    def get_end(self):
        if self.date_end_actual:
            return self.date_end_actual
        return self.date_end_planned

class Transaction(BaseModel):
    activity_id = CharField()
    value = FloatField()
    iati_identifier = CharField()
    value_date = CharField()
    value_currency = CharField()
    transaction_type = CharField()
    transaction_type_code = CharField()
    provider_org = CharField()
    provider_org_ref = CharField()
    provider_org_type = CharField()
    receiver_org = CharField()
    receiver_org_ref = CharField()
    receiver_org_type = CharField()
    description = CharField()
    transaction_date = CharField()
    transaction_date_iso = CharField()
    flow_type = CharField()
    flow_type_code = CharField()
    aid_type = CharField()
    aid_type_code = CharField()
    finance_type = CharField()
    finance_type_code = CharField()
    tied_status = CharField()
    tied_status_code = CharField()
    disbursement_channel_code = CharField()

    class Meta:
        db_table = 'atransaction'
        # indexes = ('iati_identifier',)

class Sector(BaseModel):
    activity_iati_identifier = CharField()
    name = CharField()
    vocabulary = CharField()
    code = CharField()
    percentage = IntegerField

    class Meta:
        db_table = 'sector'
        # indexes = ('activity_iati_identifier',)

class RelatedActivity(BaseModel):
    activity_id = CharField()
    reltext = CharField()
    relref = CharField()
    reltype = CharField()

    class Meta:
        db_table = 'relatedactivity'
        # indexes = ('activity_id',)

class Country(BaseModel):
    name = CharField()
    two_char_iso_code = CharField(max_length=2)
    three_char_iso_code = CharField(max_length=3)
    population = IntegerField()
    gdp = BigIntegerField()

    class Meta:
        db_table = 'countries'
