import psycopg2
import secrets
import pandas as pd

def init_connection():
    global connection
    connection = psycopg2.connect(user = "postgres",
                                  password = "Passw0rd",
                                  host = "127.0.0.1",
                                  port = "5432",
                                  database = "campaign-management0.1")
def ConnectionError(func):
    def wrapper(*args,**kwargs):
        try:
            return func(*args,**kwargs)
        except psycopg2.InterfaceError:
            init_connection()
            return func(*args,**kwargs)
        except psycopg2.InternalError:
            connection.close()
            init_connection()
            return func(*args,**kwargs)
        except:
            return {'Error': 'Internal Error in '+func.__name__}
    return wrapper

@ConnectionError
def add_farmer(FirstName=None, LastName=None, Gender=None, DOB=None, IDType=None, IDNo=None, MobileNo=None, Email=None, LandArea=None, FarmingType=None, SoilType=None, Location=None, Region=None, Country=None, PinCode=None, CreatedBy=None):
    cursor=connection.cursor()
    query="""INSERT INTO public.farmers("FirstName", "LastName", "Gender", "DOB", "IDType", "IDNo", "MobileNo", "Email", "LandArea", "FarmingType", "SoilType", "Location", "Region", "Country", "PinCode", "CreatedBy") VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
    values=(FirstName, LastName, Gender, DOB, IDType, IDNo, MobileNo, Email, LandArea, FarmingType, SoilType, Location, Region, Country, PinCode, CreatedBy)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:x
        cursor.close()
        return {"Error":"Creating Farmer Error"}

@ConnectionError
def add_expert(Name=None, Email=None, Gender=None, CreatedBy=None, Role=None):
    cursor=connection.cursor()
    query="""INSERT INTO public.experts(
	"Name", "Email", "Gender", "CreatedBy", "Role")
	VALUES (%s, %s, %s, %s, %s)"""
    values=(Name, Email, Gender, CreatedBy, Role)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Creating Expert Error"}
@ConnectionError
def add_group(Group, Description=None):
    cursor=connection.cursor()
    query="""INSERT INTO public."CampaignGroup"("Group", "Description") VALUES (%s,%s);"""
    values=(Group, Description)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Adding Group Error"}
@ConnectionError
def add_campaign(SentBy=None, Name=None, Description=None, Comments=None, CreatedBy=None, Status=None, TargetSelectionMode=None, StartDate=None, EndDate=None, GroupID=None):
    cursor=connection.cursor()
    query=""" INSERT INTO public."Campaign"(
	"SentBy", "Name", "Description", "Comments", "CreatedBy", "Status", "TargetSelectionMode", "StartDate", "EndDate", "GroupID")
	VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s); """
    values=(SentBy, Name, Description, Comments, CreatedBy, Status, TargetSelectionMode, StartDate, EndDate, GroupID)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Adding Campaign Error"}

@ConnectionError
def add_TargetChannel(CampaignID=None, ChannelID=None, Status=None, CreatedBy=None):
    cursor=connection.cursor()
    query="""INSERT INTO public."CampaignTargetChannel"(
    "CampaignID", "ChannelID", "Status", "CreatedBy") 
    VALUES (%s,%s,%s,%s);"""
    values=(CampaignID, ChannelID, Status, CreatedBy)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Adding TargetChannel Error"}

@ConnectionError
def add_Target(CampaignID=None, FarmerID=None, SentDate=None, CreatedBy=None, Status=None):
    cursor=connection.cursor()
    query="""INSERT INTO public."CampaignTargetList"(
	"CampaignID", "FarmerID", "SentDate", "CreatedBy", "Status")
	VALUES (?, ?, ?, ?, ?);"""
    values=(CampaignID, FarmerID, SentDate, CreatedBy, Status)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Adding TargetList Error"}

@ConnectionError
def get_groups():
    try:
        query="""SELECT * FROM public."CampaignGroup"; """
        data = pd.read_sql(query, connection)
        return data
    except:
        return False

@ConnectionError
def get_channels():
    try:
        query="""select * from "Channels";"""
        data = pd.read_sql(query, connection)
        return data
    except:
        return False

@ConnectionError
def get_campaigns():
    try:
        query="""select * from "Campaigns";"""
        data = pd.read_sql(query, connection)
        return data
    except:
        return False

@ConnectionError
def get_campaignlines():
    try:
        cursor=connection.cursor()
        query="""select * from public.campaignlines WHERE CampID=%s;"""
        values=(apikey,)
        cursor.execute(query,values)
        data=cursor.fetchall()
        if data:
            cursor.close()
            return data
        else:
            cursor.close()
            return {}
    except:
        return False

init_connection()

if __name__=='__main__':
    pass