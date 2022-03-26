from flask import Blueprint,make_response, request, jsonify,Response
from flask_login import login_required,current_user
import os
import pandas as pd
import psycopg2,psycopg2.extras
import json
from pandas import read_csv
from werkzeug.utils import secure_filename
from azure.storage.blob import BlockBlobService
from datetime import datetime
import requests
from bs4 import BeautifulSoup
import unicodedata
from .. import auth
import base64
import math

# Blueprint Configuration
controller_bp = Blueprint(
    'controller_bp', __name__,
    template_folder='templates',
    static_folder='static'
)
def init_connection():
    global connection
    global notifications
    notifications={}
    _connection=os.environ.get("PROD_DATABASE_URI").split('//')[1]
    connection = psycopg2.connect(user = _connection.split(':')[0],
                                  password = _connection.split(':')[1].split('@')[0],
                                  host = _connection.split(':')[1].split('@')[1],
                                  port = _connection.split(':')[2].split('/')[0],
                                  database = _connection.split(':')[2].split('/')[1])
init_connection()

def ConnectionError(func):
    def connection_wrapper(*args,**kwargs):
        try:
            return func(*args,**kwargs)
        except psycopg2.InterfaceError:
            init_connection()
            return func(*args,**kwargs)
        except psycopg2.InternalError:
            connection.close()
            init_connection()
            return func(*args,**kwargs)
        except Exception as e:
            print(e)
            return {'Error': 'Internal Error in '+func.__name__}
    return connection_wrapper

block_blob_service = BlockBlobService(os.environ.get("Blob_account_name"),os.environ.get("Blob_account_key"))
def blobsave(stream,filename):
    container_name =os.environ.get("Blob_container")
    block_blob_service.create_blob_from_bytes(container_name,filename,stream)
    uri=block_blob_service.protocol+'://'+block_blob_service.primary_endpoint+'/'+container_name+'/'+filename
    return uri

AppInsights_instrumentalkey = os.environ.get("AppInsights_instrumentalkey")
AppInsights_apikey = os.environ.get("AppInsights_apikey")

def bot_auth(request):
    if request.authorization['username']=='Dardlea' and request.authorization['password']=='Passw0rd':
        return True
    else:
        return False

@controller_bp.route("/get/farmers/<farmerid>",methods=['GET'])
#@login_required
def send_farmers(farmerid):
    filters=None
    broadcastlog=''
    if int(farmerid):
        filters={'FarmerID':int(farmerid)}
    else:
        broadcastlog=get_broadcast_log()
    headers = {"Content-Type": "application/json"}
    try:
        farmers=get_farmers(filters=filters)
        final_data={
            'farmers':farmers,
            'broadcastlog':broadcastlog
        }
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)
    
    return make_response(jsonify(final_data), 200, headers)

@controller_bp.route("/get/farmers/crops/<farmerid>",methods=['GET'])
#@login_required
def send_farmer_crops(farmerid):
    filters=None
    if int(farmerid):
        filters={'FarmerID':int(farmerid)}
    headers = {"Content-Type": "application/json"}
    try:
        data=get_farmer_crops(filters=filters)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/farmers/lands/<farmerid>",methods=['GET'])
#@login_required
def send_farmer_lands(farmerid):
    filters=None
    if int(farmerid):
        filters={'FarmerID':int(farmerid)}
    headers = {"Content-Type": "application/json"}
    try:
        data=get_farmer_lands(filters=filters)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)
 
@controller_bp.route("/get/farmers/channels/<farmerid>",methods=['GET'])
#@login_required
def send_farmer_channels(farmerid):
    filters=None
    if int(farmerid):
        filters={'FarmerID':int(farmerid)}
    headers = {"Content-Type": "application/json"}
    try:
        data=get_farmer_channels(filters=filters)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/farmers/tags/<farmerid>",methods=['GET'])
#@login_required
def send_farmer_tags(farmerid):
    filters=None
    if int(farmerid):
        where={'FarmerID':int(farmerid)}
    headers = {"Content-Type": "application/json"}
    try:
        data=get_table('FarmerTags',where=where,filters=['TagName'])
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/farmers/form",methods=['GET'])
#@login_required
def send_farmer_form():
    headers = {"Content-Type": "application/json"}
    try:
        # CropCategory,CropSector,OwnershipType,WaterSourceType,LandType,SoilType =get_farmer_form()
        OwnershipType,WaterSourceType,LandType,SoilType =get_farmer_form()
        Crops=get_crops(jinja=False)
        Crops=Crops[Crops['Status']==True]
        Crops = json.loads(Crops.to_json(orient='records'))
        FarmerGroup=get_target_groups(jinja=False)
        FarmerGroup=FarmerGroup[FarmerGroup['Status']==True]
        FarmerGroup = json.loads(FarmerGroup.to_json(orient='records'))
        final_data={
                    'OwnershipType':OwnershipType,
                    'WaterSourceType': WaterSourceType,
                    "LandType":LandType,
                    "SoilType":SoilType,
                    "CropName":Crops,
                    "FarmerGroup":FarmerGroup
                    }
        return make_response(jsonify(final_data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/campaigns",methods=['GET'])
#@login_required
def send_campaigns():
    headers = {"Content-Type": "application/json"}
    try:
        data=get_campaigns()
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/campaign/details/<campid>",methods=['GET'])
#@login_required
def send_campaign_details(campid):
    headers = {"Content-Type": "application/json"}
    try:
        where={'CampaignID':campid}
        
        target_list=get_table('CampaignTargetList',where=where)
        media=get_table('CampaignMedia',where=where)
        campaign=get_table('Campaign',where=where)
        channels=get_channels()
        target_channel=get_table('CampaignTargetChannel',where=where)
        query='Select "BrodcastID","FarmerID","FarmerName","Channel",COALESCE(to_char("CreatedDate", \'YYYY-MM-DD\'), \'\') AS "CreatedDate","Status" from public."BroadcastLog" where "CampaignID"='+str(campid)
        broadcast_log=get_query(query)
        final_data={'campaign':campaign,
                    'TargetList':target_list,
                    'media':media,
                    'TargetChannel':target_channel,
                    'channels':channels,
                    'BroadcastLog':broadcast_log}
        return make_response(jsonify(final_data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/campaign/edit/details/<campid>",methods=['GET'])
#@login_required
def send_campaign_edit_details(campid):
    headers = {"Content-Type": "application/json"}
    try:
        where={'CampaignID':campid}
        
        target_list=get_table('CampaignTargetList',where=where)
        media=get_table('CampaignMedia',where=where)
        campaign=get_table('Campaign',where=where)

        #getting target list and populating it.
        if campaign[0]["TargetSelectionMode"]=='Manual':
            query='SELECT b."IDNo" from public."CampaignTargetList" a left join public."Farmers" b on a."FarmerID"=b."FarmerID" where a."CampaignID"='+str(campid) +';'
            edit_target_data=get_query(query,jinja=False)
            x=list(edit_target_data['IDNo'])#converting it into specific format so that it will match when creating a campaign
            x=tuple(map(str,x))
            filters={'IDNo':x}
            edit_target_data=get_farmers_oftuple(filters=filters)
        else:
            edit_target_data=get_farmers(jinja=False)
            edit_target_data=edit_target_data[edit_target_data['Status']==True]
            edit_target_data = json.loads(edit_target_data.to_json(orient='records'))

        target_channel=get_table('CampaignTargetChannel',where=where)
        final_data={'campaign':campaign,
                    # 'TargetList':target_list,
                    'media':media,
                    'TargetChannel':target_channel,
                    'EditTargetData':edit_target_data}
        return make_response(jsonify(final_data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/campaigns/new",methods=['GET'])
#@login_required
def send_newcampaign_form_data():
    headers = {"Content-Type": "application/json"}
    try:
        channels_data=get_channels(jinja=False)
        channels_data=channels_data[channels_data['Status']==True]
        channels_data = json.loads(channels_data.to_json(orient='records'))
        
        campaigns_groups_data=get_campaign_groups(jinja=False)
        campaigns_groups_data=campaigns_groups_data[campaigns_groups_data['Status']==True]
        campaigns_groups_data = json.loads(campaigns_groups_data.to_json(orient='records'))
        
        target_groups_data=get_target_groups(jinja=False)
        target_groups_data=target_groups_data[target_groups_data['Status']==True]
        target_groups_data = json.loads(target_groups_data.to_json(orient='records'))

        farmers_data=get_farmers(jinja=False)
        farmers_data=farmers_data[farmers_data['Status']==True]
        farmers_data = json.loads(farmers_data.to_json(orient='records'))

        tags_data=get_table('FarmerTags',filters=['TagName','FarmerID'])
        query="""SELECT unnest(enum_range(NULL::"TargetSelectionMode"));"""
        TargetSelectionMode = pd.read_sql(query, connection)
        TargetSelectionMode = json.loads(TargetSelectionMode.to_json(orient='records'))
        final_data={'target_groups':target_groups_data,
                    'channels':channels_data,
                    'campaign_groups':campaigns_groups_data,
                    'farmer_list': farmers_data,
                    "TargetSelectionMode":TargetSelectionMode,
                    'tag_data':tags_data
                    }
        return make_response(jsonify(final_data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/users",methods=['GET'])
#@login_required
def send_users():
    headers = {"Content-Type": "application/json"}
    try:
        data=get_users()
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/channels",methods=['GET'])
#@login_required
def send_channels():
    headers = {"Content-Type": "application/json"}
    try:
        data=get_channels()
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/crops",methods=['GET'])
#@login_required
def send_crops():
    headers = {"Content-Type": "application/json"}
    try:
        data=get_crops()
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/crops/form",methods=['GET'])
#@login_required
def send_crops_form():
    headers = {"Content-Type": "application/json"}
    try:
        CropCategory,CropSector=get_crops_form()
        final_data={
            "CropCategory":CropCategory,
            "CropSector":CropSector
        }
        return make_response(jsonify(final_data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)
@controller_bp.route("/get/farmergroup",methods=['GET'])

#@login_required
def send_farmergroup():
    headers = {"Content-Type": "application/json"}
    try:
        data=get_target_groups()
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/campaign_groups",methods=['GET'])
#@login_required
def send_campaign_groups():
    headers = {"Content-Type": "application/json"}
    try:
        data=get_campaign_groups()
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/broadcast_log",methods=['GET'])
#@login_required
def send_broadcast_log():
    headers = {"Content-Type": "application/json"}
    try:
        data=get_broadcast_log()
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/tickets",methods=['GET'])
#@login_required
def send_tickets():
    headers = {"Content-Type": "application/json"}
    try:
        tickets=get_tickets()
        return make_response(jsonify(tickets), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/organizationsettings",methods=['GET'])
#@login_required
def send_orgsettings():
    headers = {"Content-Type": "application/json"}
    try:
        table='OrganizationSettings'
        where={'OrganizationID':current_user.OrganizationID}
        data=get_table(table,where)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/org",methods=['GET'])
#@login_required
def get_org():
    headers = {"Content-Type": "application/json"}
    try:
        data=get_table('Organizations',where={'OrganizationID':current_user.OrganizationID})
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/orgsettings",methods=['GET'])
#@login_required
def get_org_settings():
    headers = {"Content-Type": "application/json"}
    try:
        data=get_table('OrganizationSettings',where={'OrganizationID':current_user.OrganizationID})
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/orgsubscriptions",methods=['GET'])
#@login_required
def get_org_subscription():
    headers = {"Content-Type": "application/json"}
    try:
        data=get_table('OrganizationSubscription',where={'OrganizationID':current_user.OrganizationID})
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/MessagesCampaign",methods=['GET'])
#@login_required
def get_dash_msgcampaign():
    headers = {"Content-Type": "application/json"}
    try:
        query="select Count(\"Campaign\".\"Name\") as count1,\"Campaign\".\"Name\" from public.\"BroadcastLog\" inner join public.\"Campaign\" on public.\"Campaign\".\"CampaignID\"=public.\"BroadcastLog\".\"CampaignID\" where \"Campaign\".\"OrganizationID\"=" + str(current_user.OrganizationID)+" group by \"Campaign\".\"Name\" Order by count1"
        data=get_query(query)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/MessagesbyCampaignNames",methods=['GET'])
#@login_required
def get_dash_msgbycampaignname():
    headers = {"Content-Type": "application/json"}
    try:
        query="SELECT count(\"se\".\"BrodcastID\"),\"cam\".\"Name\"::text,\"se\".\"Channel\" FROM (SELECT to_char(date_trunc('day', (current_date - offs)), 'YYYY-MM-DD' ) AS date FROM generate_series(0,7) AS offs) d LEFT OUTER JOIN public.\"BroadcastLog\" se ON d.date = to_char(date_trunc('day', \"se\".\"CreatedDate\"), 'YYYY-MM-DD')  Left OUTER JOIN public.\"Campaign\" cam on \"cam\".\"CampaignID\" = \"se\".\"CampaignID\" Where \"cam\".\"Name\" !='' GROUP BY \"cam\".\"Name\",\"se\".\"Channel\" Order by count DESC"
        data=get_query(query)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/MessagesbyStatus7",methods=['GET'])
#@login_required
def get_dash_MessagesbyStatus7():
    headers = {"Content-Type": "application/json"}
    try:
        query="SELECT d.date, count(\"se\".\"Status\"),\"se\".\"Status\"::text FROM (SELECT to_char(date_trunc('day', (current_date - offs)), 'YYYY-MM-DD' ) AS date FROM generate_series(0,7) AS offs) d LEFT OUTER JOIN public.\"BroadcastLog\" se ON d.date = to_char(date_trunc('day', \"se\".\"CreatedDate\"), 'YYYY-MM-DD') GROUP BY d.date,\"se\".\"Status\"  Order by d.date "
        data=get_query(query,jinja=False)
        data=data.fillna("")
        data=json.loads(data.to_json(orient='records'))
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/Messagesbycampaigngroup",methods=['GET'])
#@login_required
def get_dash_Messagesbycampaigngroup():
    headers = {"Content-Type": "application/json"}
    try:
        query="select Count(distinct \"ca\".\"BrodcastID\" ) as count,\"cg\".\"Group\" from public.\"CampaignGroup\" Left join public.\"Campaign\" cg on \"cg\".\"Group\"=\"CampaignGroup\".\"Group\" Left join public.\"BroadcastLog\" ca on  \"ca\".\"CampaignID\"= \"cg\".\"CampaignID\" where \"cg\".\"OrganizationID\"=" + str(current_user.OrganizationID)+" group by \"cg\".\"Group\" Order by count"
        data=get_query(query)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/Messageshistory",methods=['GET'])
#@login_required
def get_dash_Messageshistory():
    headers = {"Content-Type": "application/json"}
    try:
        query="select count(\"BrodcastID\") from public.\"BroadcastLog\" where EXTRACT(MONTH FROM \"CreatedDate\") = EXTRACT(MONTH FROM CURRENT_DATE) and \"OrganizationID\"=" + str(current_user.OrganizationID)+" and \"Status\"='Completed'"
        data1=get_query(query)
        query="select count(\"BrodcastID\") from public.\"BroadcastLog\" where EXTRACT(MONTH FROM \"CreatedDate\") = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 months') and \"OrganizationID\"=" + str(current_user.OrganizationID)
        data2=get_query(query)
        data1.append(data2[0])
        return make_response(jsonify(data1), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/MessagesbyChannelpast7days",methods=['GET'])
#@login_required
def get_dash_MessagesbyChannelpast7days():
    headers = {"Content-Type": "application/json"}
    try:
        query="SELECT d.date, count(\"se\".\"Channel\"),\"c\".\"Channel\" FROM (SELECT to_char(date_trunc('day', (current_date - offs)), 'YYYY-MM-DD' ) AS date FROM generate_series(0,7) AS offs) d LEFT OUTER JOIN public.\"BroadcastLog\" se ON d.date = to_char(date_trunc('day', \"se\".\"CreatedDate\"), 'YYYY-MM-DD') Left OUTER JOIN public.\"Channels\" c on \"se\".\"Channel\"=\"c\".\"Channel\" where \"se\".\"Status\" !='Error'  GROUP BY d.date,\"se\".\"Channel\",\"c\".\"Channel\" Order by d.date DESC,\"c\".\"Channel\""
        data=get_query(query)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/MessagesbyChanneltoday",methods=['GET'])
#@login_required
def get_dash_MessagesbyChanneltoday():
    headers = {"Content-Type": "application/json"}
    try:
        query="select count(\"Channel\"),\"Channel\" from public.\"BroadcastLog\" where \"CreatedDate\">=current_date and \"OrganizationID\"=" + str(current_user.OrganizationID)+" and \"Status\" !='Error' GROUP BY \"Channel\""
        data=get_query(query)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/MessagesbyStatustoday",methods=['GET'])
#@login_required
def get_dash_MessagesbyStatustoday():
    headers = {"Content-Type": "application/json"}
    try:
        query="select count(\"Status\"),\"Status\"::text From public.\"BroadcastLog\" where \"CreatedDate\">=current_date and \"OrganizationID\"=" + str(current_user.OrganizationID)+" Group by \"Status\""
        data=get_query(query)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/campaignsummary",methods=['GET'])
#@login_required
def get_dash_campaignsummary():
    headers = {"Content-Type": "application/json"}
    try:
        query="select count (\"CampaignID\") from public.\"Campaign\" where \"OrganizationID\"=" + str(current_user.OrganizationID)+" and \"Status\"='Completed'"
        campaigns=get_query(query)
        query="select count (\"FarmerID\") from public.\"Farmers\" where \"OrganizationID\"=" + str(current_user.OrganizationID)+" and \"Status\"='true'"
        farmers=get_query(query)
        query="select count (\"BrodcastID\") from public.\"BroadcastLog\" where \"OrganizationID\"=" + str(current_user.OrganizationID)+" and \"Status\"='Completed'"
        success=get_query(query)
        query="select count (\"BrodcastID\") from public.\"BroadcastLog\" where \"OrganizationID\"=" + str(current_user.OrganizationID)+" and \"Status\"='Error'"
        errors=get_query(query)
        final_data={
            'campaigns':campaigns[0]['count'],
            'farmers':farmers[0]['count'],
            'success':success[0]['count'],
            'errors':errors[0]['count']
        }
        return make_response(jsonify(final_data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/botanalytics/hits",methods=['GET'])
#@login_required
def get_botanalytics_hits():
    headers = {"Content-Type": "application/json"}
    try:
        request_headers = { 'x-api-key': AppInsights_apikey }
        url = "https://api.applicationinsights.io/v1/apps/" + AppInsights_instrumentalkey + "/query?query=let queryStartDate = ago(30d);let queryEndDate = now();traces | where message !contains 'Dialog View' |where message !contains 'Message' | where timestamp > queryStartDate | where timestamp < queryEndDate|summarize count() by message"
        response = requests.get(url, headers=request_headers)
        data=eval(response.text)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/botanalytics/baralc",methods=['GET'])
#@login_required
def get_botanalytics_baralc():
    headers = {"Content-Type": "application/json"}
    try:
        request_headers = { 'x-api-key': AppInsights_apikey }
        url = "https://api.applicationinsights.io/v1/apps/" + AppInsights_instrumentalkey + "/query?query=let queryStartDate = ago(30d);let queryEndDate = now(); customEvents | where timestamp >queryStartDate| where timestamp < queryEndDate| where name=='WaterfallStart'| extend DialogId = customDimensions['DialogId']| extend instanceId = tostring(customDimensions['InstanceId'])| join kind=leftouter (customEvents | where name=='WaterfallCancel' | extend instanceId = tostring(customDimensions['InstanceId'])) on instanceId | join kind=leftouter (customEvents | where name=='WaterfallComplete' | extend instanceId = tostring(customDimensions['InstanceId'])) on instanceId | extend duration = case(not(isnull(timestamp1)), timestamp1 - timestamp,not(isnull(timestamp2)), timestamp2 - timestamp, 0s) | extend seconds = round(duration / 1s)| summarize AvgSeconds=avg(seconds) by tostring(DialogId)| order by AvgSeconds desc nulls last | render barchart with (title='Duration in Dialog')"
        response = requests.get(url, headers=request_headers)
        data=eval(response.text)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/botanalytics/call3",methods=['GET'])
#@login_required
def get_botanalytics_call3():
    headers = {"Content-Type": "application/json"}
    try:
        request_headers = { 'x-api-key': AppInsights_apikey }
        url = "https://api.applicationinsights.io/v1/apps/" + AppInsights_instrumentalkey + "/query?query=let queryStartDate = ago(30d);let queryEndDate = now();let groupByInterval = 1d;customEvents | where timestamp >queryStartDate| where timestamp < queryEndDate| summarize uc=dcount(user_Id) by bin(timestamp,groupByInterval),tostring(customDimensions.channelId)| where customDimensions_channelId !='' | order by timestamp"
        response = requests.get(url, headers=request_headers)
        data=eval(response.text)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/botanalytics/call4",methods=['GET'])
#@login_required
def get_botanalytics_call4():
    headers = {"Content-Type": "application/json"}
    try:
        request_headers = { 'x-api-key': AppInsights_apikey }
        url = "https://api.applicationinsights.io/v1/apps/" + AppInsights_instrumentalkey + "/query?query=requests  |project itemCount,customDimensions.channelId|summarize count() by tostring(customDimensions_channelId)"
        response = requests.get(url, headers=request_headers)
        data=eval(response.text)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/botanalytics/call5",methods=['GET'])
#@login_required
def get_botanalytics_call5():
    headers = {"Content-Type": "application/json"}
    try:
        request_headers = { 'x-api-key': AppInsights_apikey }
        url = "https://api.applicationinsights.io/v1/apps/" + AppInsights_instrumentalkey + "/query?query=dependencies| project target,['type'],itemCount| summarize count() by target"
        response = requests.get(url, headers=request_headers)
        data=eval(response.text)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/botanalytics/call6",methods=['GET'])
#@login_required
def get_botanalytics_call6():
    headers = {"Content-Type": "application/json"}
    try:
        request_headers = { 'x-api-key': AppInsights_apikey }
        url = "https://api.applicationinsights.io/v1/apps/" + AppInsights_instrumentalkey + "/query?query=let queryStartDate = ago(30d);let queryEndDate = now();let groupByInterval = 1d;customEvents | where timestamp > queryStartDate| where timestamp < queryEndDate| summarize uc=dcount(user_Id) by bin(timestamp, groupByInterval)|order by timestamp | render timechart"
        response = requests.get(url, headers=request_headers)
        data=eval(response.text)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/botanalytics/call7",methods=['GET'])
#@login_required
def get_botanalytics_call7():
    headers = {"Content-Type": "application/json"}
    try:
        request_headers = { 'x-api-key': AppInsights_apikey }
        url = "https://api.applicationinsights.io/v1/apps/" + AppInsights_instrumentalkey + "/query?query=traces| project customDimensions.UserName,customDimensions.channelId| where customDimensions_UserName != tostring('')|where customDimensions_channelId != tostring('')| distinct tostring(customDimensions_UserName),tostring(customDimensions_channelId)"
        response = requests.get(url, headers=request_headers)
        data=eval(response.text)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/get/dashboard/botanalytics/call8",methods=['GET'])
#@login_required
def get_botanalytics_call8():
    headers = {"Content-Type": "application/json"}
    try:
        request_headers = { 'x-api-key': AppInsights_apikey }
        url = "https://api.applicationinsights.io/v1/apps/" + AppInsights_instrumentalkey + "/query?query=let queryStartDate = ago(30d); let queryEndDate =now(); let interval = 1h; customEvents  | where timestamp > queryStartDate | where timestamp < queryEndDate | extend InstanceId =tostring(customDimensions['InstanceId'])| extend DialogId = tostring(customDimensions['DialogId'])| extend ActivityId =tostring(customDimensions['activityId'])| where DialogId != '' and InstanceId != '' and user_Id != ''|extend metric = ActivityId | summarize Count=dcount(metric) by tostring(customDimensions.channelId),format_datetime(timestamp,'yyyy-MM-dd') |order by Count desc nulls last | order by timestamp"
        response = requests.get(url, headers=request_headers)
        data=eval(response.text)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/api/get/farmers",methods=['GET'])
def api_send_farmers():
    headers = {"Content-Type": "application/json"}
    if not bot_auth(request):
        return "Access Denied",401
    try:
        try:
            filters=eval(request.args['filters'])
        except Exception as e:
            return make_response(jsonify({'Error': "Invalid Parameters"}), 400, headers)
        data=api_get_farmers(filters=filters)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/api/get/farmerchannels",methods=['GET'])
def api_send_farmerchannels():
    headers = {"Content-Type": "application/json"}
    if not bot_auth(request):
        return "Access Denied",401
    try:
        guid=request.args["Guid"]
        OrganizationID=request.args["OrganizationID"]
        query="""SELECT * FROM public."FarmerChannelMapping"
         WHERE "OrganizationID"="""+str(OrganizationID)+""" and "GUID"='"""+ guid +"""';"""
        data = pd.read_sql(query, connection)
        data = json.loads(data.to_json(orient='records'))
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/api/insert/farmerchannel",methods=['POST'])
def api_post_new_farmerchannel():
    headers = {"Content-Type": "application/json"}
    if not bot_auth(request):
        return "Access Denied",401
    try:
        CreatedBy=4 #Hard Coded parameters
        OrganizationID=int(request.args["OrganizationID"])
        ConversationID=request.args["ConversationID"]
        Guid=request.args["Guid"]
        Channel=request.args["Channel"]
        assert add_farmerchannel(Channel=Channel,GUID=Guid,ConversationID=ConversationID,OrganizationID=OrganizationID,CreatedBy=CreatedBy)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/api/update/farmerchannel",methods=['POST'])
def post_update_farmerchannel():
    headers = {"Content-Type": "application/json"}
    if not bot_auth(request):
        return "Access Denied",401
    try:
        Guid=request.args["Guid"]
        LastName=request.args["LastName"]
        CreatedBy=4#Hard Coded
        try:
            FarmerID=int(request.args["FarmerID"])
        except Exception as e:
            FirstName=request.args["FirstName"]
            Gender=request.args["Gender"]
            MobileNo=request.args["MobileNo"]
            IDNo=request.args["IDNo"]
            try:
                DOB=get_dob(IDNo[:6])
            except:
                return make_response(jsonify({'Error': 'Unable to fetch DOB from IDNo'}), 400, headers)
            Geography=request.args["Geography"]
            OrganizationID=request.args["OrganizationID"]
            FarmerID = add_farmer(FirstName=FirstName,LastName=LastName,IDNo=IDNo,Gender=Gender,Geography=Geography,MobileNo=MobileNo,OrganizationID=OrganizationID,CreatedBy=CreatedBy,InsertedThrough='Chatbot',get_farmerid=True,DOB=DOB,Status='true')
            Tags=[]
            Tags.append(Gender.lower())
            Tags.append(Geography.lower())
            Tags.append(MobileNo.lower())
            Tags.append(IDNo.lower())
            df = pd.DataFrame({'FarmerID':[FarmerID]*len(Tags),'TagName':Tags})
            assert insert_table('FarmerTags',df,CreatedBy,OrganizationID,OrganizationName='Dardlea')==1#Hard Coded Dardle
        filters={"FarmerID":FarmerID,
                "FarmerName":LastName,
                "ModifiedBy":4,#Hard Coded
                "ModifiedDate":"now"
                }
        assert update_farmerchannel(Guid,filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

#using the following api in dashboard integration(pavan)
@controller_bp.route("/api/db/query",methods=['GET'])
def get_from_db():
    headers = {"Content-Type": "application/json"}
    if not bot_auth(request):
        return "Access Denied",401
    try:
        query=request.args["query"]
        data = pd.read_sql(query, connection)
        data = json.loads(data.to_json(orient='records'))
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/insert/farmer",methods=['POST'])
#@login_required
def post_insert_farmer_details():
    headers = {"Content-Type": "application/json"}
    try:
        FirstName=request.form["FirstName"]
        LastName=request.form["LastName"]
        MobileNo=request.form['CountryCode']+request.form["MobileNo"]
        IDNo=request.form["IDNo"]
        try:
            DOB=get_dob(IDNo[:6])
        except:
            return make_response(jsonify({'Error': 'Unable to fetch DOB from IDNo'}), 400, headers)
        Geography=request.form["Geography"]
        Gender=request.form["Gender"]
        FarmerGroupID=request.form["FarmerGroup"]
        OrganizationID=current_user.OrganizationID
        OrganizationName=current_user.OrganizationName
        CreatedBy=current_user.id
        FarmerID=add_farmer(FirstName=FirstName,LastName=LastName,Geography=Geography,IDNo=IDNo,MobileNo=MobileNo,Gender=Gender,FarmerGroupID=FarmerGroupID,OrganizationID=OrganizationID,CreatedBy=CreatedBy,OrganizationName=OrganizationName,DOB=DOB,Status='true',InsertedThrough='Website',get_farmerid=True)
        # insert tags
        Tags=[i.lower() for i in request.form['FarmerTags'].split(',')]
        if Gender.lower() not in Tags:
            Tags.append(Gender.lower())
        if Geography.lower() not in Tags:
            Tags.append(Geography.lower())
        if MobileNo.lower() not in Tags:
            Tags.append(MobileNo.lower())
        if IDNo.lower() not in Tags:
            Tags.append(IDNo.lower())
        df = pd.DataFrame({'FarmerID':[FarmerID]*len(Tags),'TagName':Tags})
        assert insert_table('FarmerTags',df,CreatedBy,OrganizationID,OrganizationName)==1
        
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/insert/farmer/excel",methods=['POST'])
#@login_required
def post_insert_farmer_excel():
    headers = {"Content-Type": "application/json"}
    try:
        a=request.files['farmer_excel']
        if a.filename.split('.')[len(a.filename.split('.'))-1] !='xlsx':
            return make_response(jsonify({'Error': 'Please Upload only xlsx format Excel Sheet'}), 400, headers)
        data=pd.read_excel(a)
        temp=list(data)
        keys=['FirstName','LastName','Gender','IDNo','MobileNo','Geography','GroupName']
        if len(keys)!=len(temp):
            return make_response(jsonify({'Error': 'Template Structure Not Proper'}), 400, headers)    
        for i in keys:
            if i not in temp:
                return make_response(jsonify({'Error': 'Template Structure Not Proper.' +i + ' Not Found'}), 400, headers)
        query='Select "MobileNoLength","IDNoType","IDNoLength" from public."OrganizationSettings"'
        settings=pd.read_sql(query,connection)
        
        #MobileNo Check
        mobilenos=list(data['MobileNo'].apply(str).str.len())
        if not all(i>int(settings['MobileNoLength'][0]) for i in mobilenos):
            return make_response(jsonify({'Error': 'Mobile No Length Doesnt Satify Organization Settings'}), 400, headers)

        #IDNo Check
        dobs=[]
        for i in data['IDNo']:
            if settings['IDNoType'][0]=='number':
                if type(i)!=int:
                    return make_response(jsonify({'Error': 'ID No Length Format Satify Organization Settings'}), 400, headers)
                if int(math.log10(i))+1 != int(settings['IDNoLength'][0]):
                    return make_response(jsonify({'Error': 'ID No Length Doesnt Satify Organization Settings'}), 400, headers)
            else:
                if len(i) != int(settings['IDNoLength'][0]):
                    return make_response(jsonify({'Error': 'ID No Length Doesnt Satify Organization Settings'}), 400, headers)                    
            
            # if all( data[data['IDNo']==i]['Gender']=='Male' and int(i[6:10])>4999 ) or all( data[data['IDNo']==i]['Gender']=='Female' and int(i[6:10])<5000 )
            #     return make_response(jsonify({'Error': 'ID No Format Satify Organization Settings'}), 400, headers)
            
            if list(data[data['IDNo']==i]['Gender'])[0] not in ('Male','Female','Other'):
                return make_response(jsonify({'Error': 'Gender Format Incorrect'}), 400, headers)
            try:
                DOB=get_dob(str(i)[:6])
                dobs.append(DOB)
            except:
                return make_response(jsonify({'Error': 'Unable to fetch DOB from IDNo'}), 400, headers)
        data['DOB']=dobs
        query='SELECT "FarmerGroupID","GroupName" FROM public."FarmerGroup"'
        fg = pd.read_sql(query, connection)
        data=data.merge(fg,on='GroupName')
        data=data.drop(['GroupName'],axis=1)
        ids=add_farmer_fromexcel_returnid(data,current_user.id,current_user.OrganizationID,current_user.OrganizationName)
        
        for i in range(len(ids)):
            Tags=[]
            Tags.append(str(data['Gender'][i]).lower())
            Tags.append(str(data['Geography'][i]).lower())
            Tags.append(str(data['MobileNo'][i]).lower())
            Tags.append(str(data['IDNo'][i]).lower())
            df = pd.DataFrame({'FarmerID':[ids[i]]*len(Tags),'TagName':Tags})
            assert insert_table('FarmerTags',df,current_user.id,current_user.OrganizationID,current_user.OrganizationName)==1
        
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/farmer/status",methods=['POST'])
#@login_required
def post_update_farmer_status():
    headers = {"Content-Type": "application/json"}
    try:
        FarmerID=int(request.form["FarmerID"])
        filters={
                "Status":request.form['Status']
                }
        assert update_farmer(FarmerID,filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/farmer/details",methods=['POST'])
#@login_required
def post_update_farmer_details():
    headers = {"Content-Type": "application/json"}
    try:
        FarmerID=int(request.form["FarmerID"])
        FirstName=request.form["FirstName"]
        LastName=request.form["LastName"]
        MobileNo=request.form['CountryCode']+request.form["MobileNo"]
        IDNo=request.form["IDNo"]
        try:
            DOB=get_dob(IDNo[:6])
        except:
            return make_response(jsonify({'Error': 'Unable to fetch DOB from IDNo'}), 400, headers)
        Geography=request.form["Geography"]
        Gender=request.form["Gender"]
        FarmerGroupID=request.form["FarmerGroup"]
        filters={"FirstName":FirstName,
                "LastName":LastName,
                "MobileNo":int(MobileNo),
                "IDNo":IDNo,
                "Geography":Geography,
                "ModifiedBy":current_user.id,
                "ModifiedDate":"now",
                "FarmerGroupID":FarmerGroupID,
                "Gender":Gender,
                "DOB":DOB
                }
        assert update_farmer(FarmerID,filters=filters)==1
        #add tags
        query='SELECT "TagName" FROM public."FarmerTags" where "FarmerID"= '+str(FarmerID)+';'
        OldTags = list(pd.read_sql(query, connection)['TagName'])
        NewTags=[i.lower() for i in request.form['FarmerTags'].split(',')]
        AddTags=list(set([i.lower() for i in NewTags])-set([i.lower() for i in OldTags]))
        df = pd.DataFrame({'FarmerID':[FarmerID]*len(AddTags),'TagName':AddTags})
        if len(AddTags):
            assert insert_table('FarmerTags',df,current_user.id,current_user.OrganizationID,current_user.OrganizationName)==1
        #delete tags
        DeleteTags=list(set([i.lower() for i in OldTags])-set([i.lower() for i in NewTags]))
        if len(DeleteTags):
            for tag in DeleteTags:
                assert delete_rows('FarmerTags',where={'FarmerID':FarmerID,'TagName':tag})==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/farmer/crops",methods=['POST'])
#@login_required
def post_update_farmer_crop():
    headers = {"Content-Type": "application/json"}
    try:
        FarmerCropID=int(request.form["FarmerCropID"].split('rowid_')[1])
        filters={"CropID":int(request.form["CropName"]),
                "DatePlanting":request.form["DatePlanting"],
                "YieldDate":request.form["YieldDate"],
                "LandArea":float(request.form["CropLandArea"]),
                "LandType":request.form["CropLandType"],
                "SoilType":request.form["CropSoilType"],
                "ModifiedBy":current_user.id,
                "ModifiedDate":"now"
                }
        assert update_farmer_crop(FarmerCropID,filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/insert/farmer/crops",methods=['POST'])
#@login_required
def post_insert_farmer_crop():
    headers = {"Content-Type": "application/json"}
    try:
        filters={"FarmerID":int(request.form["FarmerID"]),
                "CropID":int(request.form["CropName"]),
                "DatePlanting":request.form["DatePlanting"],
                "YieldDate":request.form["YieldDate"],
                "LandArea":float(request.form["CropLandArea"]),
                "LandType":request.form["CropLandType"],
                "SoilType":request.form["CropSoilType"],
                "CreatedBy":current_user.id,
                "OrganizationID":current_user.OrganizationID,
                "OrganizationName":current_user.OrganizationName,
                }
        assert add_farmer_crop(filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/farmer/lands",methods=['POST'])
#@login_required
def post_update_farmer_land():
    headers = {"Content-Type": "application/json"}
    try:
        Latitude=request.form["Latitude"]
        Longitude=request.form["Longitude"]
        if Latitude=='':
            Latitude=0.00
        else:
            Latitude=float(Latitude)
        if Longitude=='':
            Longitude=0.00
        else:
            Longitude=float(Longitude)
        FarmerLandID=int(request.form["FarmerLandID"].split('rowid_')[1])
        filters={"LandArea":float(request.form["LandArea"]),
                "LandType":request.form["LandType"],
                "District":request.form["District"],
                "Locality":request.form["Locality"],
                "OwnershipType":request.form["OwnershipType"],
                "WaterSourceType":request.form["WaterSourceType"],
                "Latitude":Latitude,
                "Longitude":Longitude,
                "SoilType":request.form["SoilType"],
                "ModifiedBy":current_user.id,
                "ModifiedDate":"now"
                }
        assert update_farmer_land(FarmerLandID,filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/insert/farmer/lands",methods=['POST'])
#@login_required
def post_insert_farmer_land():
    headers = {"Content-Type": "application/json"}
    try:
        Latitude=request.form["Latitude"]
        Longitude=request.form["Longitude"]
        if Latitude=='':
            Latitude=0.00
        else:
            Latitude=float(Latitude)
        if Longitude=='':
            Longitude=0.00
        else:
            Longitude=float(Longitude)
        filters={"FarmerID":int(request.form["FarmerID"]),
                "LandArea":float(request.form["LandArea"]),
                "LandType":request.form["LandType"],
                "District":request.form["District"],
                "Locality":request.form["Locality"],
                "OwnershipType":request.form["OwnershipType"],
                "WaterSourceType":request.form["WaterSourceType"],
                "Latitude":Latitude,
                "Longitude":Longitude,
                "SoilType":request.form["SoilType"],
                "CreatedBy":current_user.id,
                "OrganizationID":current_user.OrganizationID,
                "OrganizationName":current_user.OrganizationName
                }
        assert add_farmer_land(filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/insert/user",methods=['POST'])
#@login_required
def post_insert_user():
    headers = {"Content-Type": "application/json"}
    try:
        existing_user = auth.models.User.query.filter_by(email=request.form['email']).first()
        if existing_user is None:
            user =auth.models.User(
                name=request.form['name'],
                email=request.form['email'],
                role=request.form['role'],
                OrganizationID=current_user.OrganizationID,
                OrganizationName=current_user.OrganizationName
            )
            user.set_password(request.form['password'])
            auth.models.db.session.add(user)
            auth.models.db.session.commit()  # Create new user
            # return redirect(url_for('settings_bp.users'))
            return make_response(jsonify({'Status': 'OK'}), 200, headers)
        return make_response(jsonify({'Error': 'UserExists'}), 500, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/user",methods=['POST'])
#@login_required
def post_update_user():
    headers = {"Content-Type": "application/json"}
    try:
        existing_user = auth.models.User.query.filter_by(email=request.form['email']).first()
        if existing_user is None:
            return make_response(jsonify({'Error': 'UserNotExists'}), 200, headers)
        
        existing_user.set_name(request.form['name'])
        existing_user.set_role(request.form['role'])
        auth.models.db.session.commit()
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/user/password",methods=['POST'])
#@login_required
def post_update_user_pass():
    headers = {"Content-Type": "application/json"}
    try:
        existing_user = auth.models.User.query.filter_by(email=request.form['pass_email']).first()
        if existing_user is None:
            return make_response(jsonify({'Error': 'UserNotExists'}), 200, headers)
        
        existing_user.set_password(request.form['pass_password'])
        auth.models.db.session.commit()
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/user/status",methods=['POST'])
#@login_required
def post_update_user_status():
    headers = {"Content-Type": "application/json"}
    try:
        existing_user = auth.models.User.query.filter_by(id=request.form['UserID']).first()
        if existing_user is None:
            return make_response(jsonify({'Error': 'UserNotExists'}), 200, headers)
        if request.form['Status']=='true':
            status=True
        elif request.form['Status']=='false':
            status=False
        existing_user.set_status(status)
        auth.models.db.session.commit()
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/crop",methods=['POST'])
#@login_required
def post_update_crop():
    headers = {"Content-Type": "application/json"}
    try:
        CropID=int(request.form["CropID"])
        filters={
                "Description":request.form["Description"],
                "CropName":request.form["CropName"],
                "CropCategory":request.form["CropCategory"],
                "CropSector":request.form["CropSector"],
                "Duration":int(request.form["Duration"]),
                "ModifiedBy":current_user.id,
                "ModifiedDate":"now"
                }
        assert update_crop(CropID,filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/crop/status",methods=['POST'])
#@login_required
def post_update_crop_status():
    headers = {"Content-Type": "application/json"}
    try:
        CropID=int(request.form["CropID"])
        filters={
                "Status":request.form['Status']
                }
        assert update_crop(CropID,filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/insert/crop",methods=['POST'])
#@login_required
def post_insert_crop():
    headers = {"Content-Type": "application/json"}
    try:
        filters={
                "Description":request.form["Description"],
                "CropName":request.form["CropName"],
                "CropCategory":request.form["CropCategory"],
                "CropSector":request.form["CropSector"],
                "Duration":int(request.form["Duration"]),
                "CreatedBy":current_user.id,
                "OrganizationID":current_user.OrganizationID,
                "OrganizationName":current_user.OrganizationName,
                }
        assert add_crop(filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/channel",methods=['POST'])
#@login_required
def post_update_channel():
    headers = {"Content-Type": "application/json"}
    try:
        ChannelID=int(request.form["ChannelID"])
        filters={
                "Description":request.form["Description"],
                "Channel":request.form["ChannelName"],
                "ModifiedBy":current_user.id,
                "ModifiedDate":"now"
                }
        assert update_channel(ChannelID,filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/channel/status",methods=['POST'])
#@login_required
def post_update_channel_status():
    headers = {"Content-Type": "application/json"}
    try:
        ChannelID=int(request.form["ChannelID"])
        filters={
                "Status":request.form['Status']
                }
        assert update_channel(ChannelID,filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/insert/channel",methods=['POST'])
#@login_required
def post_insert_channel():
    headers = {"Content-Type": "application/json"}
    try:
        filters={
                "Description":request.form["Description"],
                "Channel":request.form["ChannelName"],
                "CreatedBy":current_user.id,
                "OrganizationID":current_user.OrganizationID,
                "OrganizationName":current_user.OrganizationName,
                }
        assert add_channel(filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/insert/CropCategory",methods=['POST'])
#@login_required
def post_insert_CropCategory():
    headers = {"Content-Type": "application/json"}
    try:
        name=request.form['CropCategoryName']
        assert add_cropcategory(name)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        if e.pgcode=='42710':
            return make_response(jsonify({'Error': 'AlreadyExists'}), 500, headers)
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/insert/CropSector",methods=['POST'])
#@login_required
def post_insert_CropSector():
    headers = {"Content-Type": "application/json"}
    try:
        name=request.form['CropSectorName']
        assert add_cropsector(name)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        if e.pgcode=='42710':
            return make_response(jsonify({'Error': 'AlreadyExists'}), 500, headers)
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/insert/farmergroup",methods=['POST'])
#@login_required
def post_insert_farmergroup():
    headers = {"Content-Type": "application/json"}
    try:
        filters={
                "Description":request.form["Description"],
                "GroupName":request.form["GroupName"],
                "CreatedBy":current_user.id,
                "OrganizationID":current_user.OrganizationID,
                "OrganizationName":current_user.OrganizationName,
                }
        assert add_farmergroup(filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/farmergroup",methods=['POST'])
#@login_required
def post_update_farmergroup():
    headers = {"Content-Type": "application/json"}
    try:
        GroupID=int(request.form["GroupID"])
        filters={
                "Description":request.form["Description"],
                "GroupName":request.form["GroupName"],
                "ModifiedBy":current_user.id,
                "ModifiedDate":"now"
                }
        assert update_farmergroup(GroupID,filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/farmergroup/status",methods=['POST'])
#@login_required
def post_update_farmergroup_status():
    headers = {"Content-Type": "application/json"}
    try:
        GroupID=int(request.form["GroupID"])
        filters={
                "Status":request.form['Status']
                }
        assert update_farmergroup(GroupID,filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/insert/campaigngroup",methods=['POST'])
#@login_required
def post_insert_campaigngroup():
    headers = {"Content-Type": "application/json"}
    try:
        filters={
                "Description":request.form["Description"],
                "Group":request.form["GroupName"],
                "CreatedBy":current_user.id,
                "OrganizationID":current_user.OrganizationID,
                "OrganizationName":current_user.OrganizationName,
                }
        assert add_campaigngroup(filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/campaigngroup",methods=['POST'])
#@login_required
def post_update_campaigngroup():
    headers = {"Content-Type": "application/json"}
    try:
        GroupID=int(request.form["GroupID"])
        filters={
                "Description":request.form["Description"],
                "Group":request.form["GroupName"],
                "ModifiedBy":current_user.id,
                "ModifiedDate":"now"
                }
        assert update_campaigngroup(GroupID,filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/campaigngroup/status",methods=['POST'])
#@login_required
def post_update_campaigngroup_status():
    headers = {"Content-Type": "application/json"}
    try:
        GroupID=int(request.form["GroupID"])
        filters={
                "Status":request.form['Status']
                }
        assert update_campaigngroup(GroupID,filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/insert/campaign/farmers",methods=["POST"])
#@login_required
def post_insert_campaign_farmers():
    headers = {"Content-Type": "application/json"}
    try:
        a=request.files['farmer_excel']
        if a.filename.split('.')[len(a.filename.split('.'))-1] !='xlsx':
            return make_response(jsonify({'Error': 'Please Upload only xlsx format Excel Sheet'}), 400, headers)
        data=pd.read_excel(a)
        temp=list(data)
        keys=['FirstName','LastName','Gender','IDNo','MobileNo','Geography','GroupName']
        if len(keys)!=len(temp):
            return make_response(jsonify({'Error': 'Template Structure Not Proper'}), 400, headers)    
        for i in keys:
            if i not in temp:
                return make_response(jsonify({'Error': 'Template Structure Not Proper.' +i + ' Not Found'}), 400, headers)
        
        query='SELECT * FROM public."Farmers"'
        ids = list(pd.read_sql(query, connection)['IDNo'])
        a=data.astype({'IDNo':'str'})
        insertdata=data[~a['IDNo'].isin(ids)]
        query='SELECT "FarmerGroupID","GroupName" FROM public."FarmerGroup"'
        fg = pd.read_sql(query, connection)
        insertdata = insertdata.merge(fg, left_on='GroupName', right_on='GroupName').drop(['GroupName'],axis=1)
        if not insertdata.empty:
            query='Select "MobileNoLength","IDNoType","IDNoLength" from public."OrganizationSettings"'
            settings=pd.read_sql(query,connection)
            
            #MobileNo Check
            mobilenos=list(insertdata['MobileNo'].apply(str).str.len())
            if not all(i>int(settings['MobileNoLength'][0]) for i in mobilenos):
                return make_response(jsonify({'Error': 'Mobile No Length Doesnt Satify Organization Settings'}), 400, headers)

            #IDNo Check
            dobs=[]
            for i in insertdata['IDNo']:
                if settings['IDNoType'][0]=='number':
                    if type(i)!=int:
                        return make_response(jsonify({'Error': 'ID No Length Format Satify Organization Settings'}), 400, headers)
                    if int(math.log10(i))+1 != int(settings['IDNoLength'][0]):
                        return make_response(jsonify({'Error': 'ID No Length Doesnt Satify Organization Settings'}), 400, headers)
                else:
                    if len(i) != int(settings['IDNoLength'][0]):
                        return make_response(jsonify({'Error': 'ID No Length Doesnt Satify Organization Settings'}), 400, headers)                    
                
                # if all( insertdata[insertdata['IDNo']==i]['Gender']=='Male' and int(i[6:10])>4999 ) or all( insertdata[insertdata['IDNo']==i]['Gender']=='Female' and int(i[6:10])<5000 )
                #     return make_response(jsonify({'Error': 'ID No Format Satify Organization Settings'}), 400, headers)
                
                if list(insertdata[insertdata['IDNo']==i]['Gender'])[0] not in ('Male','Female','Other'):
                    return make_response(jsonify({'Error': 'Gender Format Incorrect'}), 400, headers)
                try:
                    DOB=get_dob(str(i)[:6])
                    dobs.append(DOB)
                except:
                    return make_response(jsonify({'Error': 'Unable to fetch DOB from IDNo'}), 400, headers)
            insertdata['DOB']=dobs
            ids=add_farmer_fromexcel_returnid(insertdata,current_user.id,current_user.OrganizationID,current_user.OrganizationName)
            
            for i in range(len(ids)):
                Tags=[]
                Tags.append(str(data['Gender'][i]).lower())
                Tags.append(str(data['Geography'][i]).lower())
                Tags.append(str(data['MobileNo'][i]).lower())
                Tags.append(str(data['IDNo'][i]).lower())
                df = pd.DataFrame({'FarmerID':[ids[i]]*len(Tags),'TagName':Tags})
                assert insert_table('FarmerTags',df,current_user.id,current_user.OrganizationID,current_user.OrganizationName)==1
        
        x=list(data['IDNo'])
        x=tuple(map(str,x))
        filters={'IDNo':x}
        data=get_farmers_oftuple(filters=filters)
        return make_response(jsonify(data), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/orgsettings",methods=["POST"])
#@login_required
def post_update_settings():
    headers = {"Content-Type": "application/json"}
    try:
        where={'OrganizationID':current_user.OrganizationID}
        filters={
                'DateFormat':request.form['DateFormat'],
                'NumberSeparator':request.form['NumberSeparator'],
                'Language':request.form['Language'],
                'MaxMediaSize':str(int(request.form['MaxMediaSize'])*1000000),
                'WorkHoursStartFrom':request.form['WorkHoursStartFrom'],
                'WorkHoursEndBy':request.form['WorkHoursEndBy'],
                'WorkWeekStartDay':request.form['WorkWeekStartDay'],
                'WorkWeekEndDay':request.form['WorkWeekEndDay'],
                'DefaultCountryCode':request.form['DefaultCountryCode'],
                'IDNoType':request.form['IDNoType'],
                'IDNoLength':request.form['IDNoLength'],
                'OOF':request.form['OOF'],
                'OofMessage':request.form['OOFM'],
                'ModifiedDate':'now',
                'ModifiedBy':current_user.id
                }
        assert update_table('OrganizationSettings',where=where,filters=filters)==1
        return make_response(jsonify({'Status': 'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/insert/campaign",methods=["POST"])
#@login_required
def post_new_campaign():
    headers = {"Content-Type": "application/json"}
    CampaignName=request.form["CampaignName"]
    CampaignDesc=request.form["CampaignDesc"]
    CampaignGroup=request.form["CampaignGroup"]
    TargetSelectionMode=request.form["TargetSelectionMode"]
    Status=request.form["Status"]
    ScheduleTime=request.form["ScheduleTime"]
    TargetGroup=None
    ManualFarmerData=None
    TargetGroupTagType=None
    FarmerTags=None
    if TargetSelectionMode=='Group':#Hard Coded
        TargetGroup=int(request.form["TargetGroup"])
    elif TargetSelectionMode=='Manual':
        ManualFarmerData=eval(request.form["ManualFarmerData"].replace('null','""'))
        ManualFarmerData=pd.DataFrame(ManualFarmerData)
    elif TargetSelectionMode=='Tags':
        TargetGroupTagType=request.form["TargetGroupTagType"]
        FarmerTags=request.form["FarmerTags"]
    channels=get_channels(jinja=False)
    Channels_selected=[]
    for item in channels.Channel:
        try:
            a=int(request.form["campaign_channel_"+item])
            Channels_selected.append(a)
        except Exception as e:
            continue
    if int(request.form['campid']):
        CampaignID=int(request.form['campid'])
        where={'CampaignID':CampaignID}
        delete_rows('CampaignTargetList',where=where)
        delete_rows('CampaignMedia',where=where)
        delete_rows('CampaignTargetChannel',where=where)
        filters={
                'Name':CampaignName,
                'Description':CampaignDesc,
                'TargetSelectionMode':TargetSelectionMode,
                'Group':CampaignGroup,
                'ModifiedBy':current_user.id,
                'ModifiedDate':'now',
                'Status':Status,
                'StartDate':ScheduleTime,
                'TargetGroupID':TargetGroup,
                'TagType':TargetGroupTagType,
                'TagNames':FarmerTags,
                'OrganizationID':current_user.OrganizationID,
                'OrganizationName':current_user.OrganizationName}
        assert update_table('Campaign',where=where,filters=filters)==1
        for ChannelID in Channels_selected:
            assert add_TargetChannel(CampaignID=CampaignID,ChannelID=ChannelID,CreatedBy=current_user.id,OrganizationID=current_user.OrganizationID,OrganizationName=current_user.OrganizationName,Status='Created')==1
    else:
        CampaignID=add_campaign(
                Name=CampaignName,
                Description=CampaignDesc,
                TargetSelectionMode=TargetSelectionMode,
                Group=CampaignGroup,
                CreatedBy=current_user.id,
                Status=Status,
                StartDate=ScheduleTime,
                TargetGroupID=TargetGroup,
                TagType=TargetGroupTagType,
                TagNames=FarmerTags,
                OrganizationID=current_user.OrganizationID,
                OrganizationName=current_user.OrganizationName,
                TargetChannels=Channels_selected
                )
    if request.form["CampaignMedia"]=='Text':
        media_data=request.form["campaign_media_Text"]
    else:
        if request.form["blob_url"]:
            media_data=request.form["blob_url"]
        else:
            media=request.files["campaign_media_"+request.form["CampaignMedia"]]
            filename=secure_filename(media.filename)
            media_data=blobsave(media.read(),str(CampaignID)+'_'+filename)
    
    assert add_campaign_media(CampaignID=CampaignID,MediaType=request.form["CampaignMedia"],Data=media_data,CreatedBy=current_user.id,OrganizationID=current_user.OrganizationID,OrganizationName=current_user.OrganizationName)==1
    
    
    if TargetSelectionMode=='All':
        query="""SELECT "FarmerID","LastName" as "FarmerName" FROM public."Farmers"
         WHERE "OrganizationID"="""+str(current_user.OrganizationID) +""";"""
        AllFarmerData = pd.read_sql(query, connection)
        AllFarmerData['CampaignID']=CampaignID
        assert insert_table('CampaignTargetList',AllFarmerData,current_user.id,current_user.OrganizationID,current_user.OrganizationName)==1
    
    elif TargetSelectionMode=='Group':
        assert add_targerlist_from_farmergroup(
            CampaignID=CampaignID,
            TargetGroupID=TargetGroup,
            CreatedBy=current_user.id,
            OrganizationID=current_user.OrganizationID,
            OrganizationName=current_user.OrganizationName)==1
    
    elif TargetSelectionMode=='Manual':
        ManualFarmerData=ManualFarmerData.drop(['FarmerGroupID','FarmerGroupName','FirstName','Gender','Geography','IDNo','MobileNo','CreatedBy'],axis=1)
        ManualFarmerData=ManualFarmerData.rename(columns={'LastName':'FarmerName'})
        ManualFarmerData['CampaignID']=CampaignID
        assert insert_table('CampaignTargetList',ManualFarmerData,current_user.id,current_user.OrganizationID,current_user.OrganizationName)==1
    
    elif TargetSelectionMode=='Tags':
        if TargetGroupTagType=='any':
            query="""SELECT distinct on (a."FarmerID") a."FarmerID",b."LastName" as "FarmerName" FROM public."FarmerTags" a left join public."Farmers" b on a."FarmerID"=b."FarmerID"  where a."TagName" in ("""
            for i in FarmerTags.split(','):
                query=query+""" '"""+i.lower()+ """',"""
            query=query[:-1]+ ');'
            data = pd.read_sql(query, connection)
        elif TargetGroupTagType=='all':
            tags=FarmerTags.split(',')
            query="""select a."FarmerID", b."LastName" as "FarmerName" from (select "FarmerID" from public."FarmerTags" where "TagName" in ( """
            for i in tags:
                query=query+""" '"""+i.lower()+ """',"""
            query=query[:-1]+ """) group by "FarmerID" having count("TagName")= """+ str(len(tags))+ """) as a left join public."Farmers" b on a."FarmerID"=b."FarmerID" """
        data = pd.read_sql(query, connection)
        data['CampaignID']=CampaignID
        assert insert_table('CampaignTargetList',data,current_user.id,current_user.OrganizationID,current_user.OrganizationName)==1
    else:
        pass
       
    return make_response(jsonify({'Status': 'OK','CampaignID':CampaignID}), 200, headers)

@controller_bp.route("/post/insert/campaign/duplicate/<campaignid>",methods=["POST"])
#@login_required
def post_duplicate_campaign(campaignid):
    headers = {"Content-Type": "application/json"}
    try:
        where={'CampaignID':campaignid}
        filters=['Name','Description','TargetSelectionMode','Group','TargetGroupID','TagType','TagNames','StartDate']
        campaigns=get_table('Campaign',where=where,filters=filters,jinja=False)
        channels=get_table('CampaignTargetChannel',where=where,filters=None,jinja=False)
        Channels_selected=[]
        for item in list(channels['ChannelID']):
            Channels_selected.append(int(item))
        CampaignID=add_campaign(
                Name=str(campaigns['Name'][0]),
                Description=str(campaigns['Description'][0]),
                TargetSelectionMode=str(campaigns['TargetSelectionMode'][0]),
                Group=str(campaigns['Group'][0]),
                CreatedBy=current_user.id,
                Status='Created',
                StartDate=campaigns['StartDate'][0],
                TargetGroupID=int(campaigns['TargetGroupID'][0]),
                TagNames=campaigns['TagNames'][0],
                TagType=campaigns['TagType'][0],
                OrganizationID=current_user.OrganizationID,
                OrganizationName=current_user.OrganizationName,
                TargetChannels=Channels_selected
                )
        
        filters=['FarmerID','FarmerName']
        targetlist=get_table('CampaignTargetList',where=where,filters=filters,jinja=False)
        targetlist['CampaignID']=CampaignID
        assert insert_table('CampaignTargetList',targetlist,CreatedBy=current_user.id,OrganizationID=current_user.OrganizationID,OrganizationName=current_user.OrganizationName)==1
        
        filters=['MediaType','Data']
        mediadata=get_table('CampaignMedia',where=where,filters=filters,jinja=False)
        mediadata['CampaignID']=CampaignID
        assert insert_table('CampaignMedia',mediadata,CreatedBy=current_user.id,OrganizationID=current_user.OrganizationID,OrganizationName=current_user.OrganizationName)==1
        
        return make_response(jsonify({'Status': 'OK','CampaignID':CampaignID}), 200, headers)
    except:
        return make_response(jsonify({'Status': 'Error'}), 500, headers)

@controller_bp.route("/post/update/campaign/delete/<campaignid>",methods=["POST"])
#@login_required
def post_delete_campaign(campaignid):
    headers = {"Content-Type": "application/json"}
    try:
        where={'CampaignID':campaignid}
        campaigns=get_table('Campaign',where=where)
        if campaigns[0]['Status']=='Created':
            assert update_table('Campaign',where={'CampaignID':campaignid},filters={'Status':'Deleted'})==1
        else:
             return make_response(jsonify({'Error':'Invalid'}), 500, headers)
        return make_response(jsonify({'Status':'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/update/campaign/cancel/<campaignid>",methods=["POST"])
#@login_required
def post_cancel_campaign(campaignid):
    headers = {"Content-Type": "application/json"}
    try:
        where={'CampaignID':campaignid,}
        # campaigns=get_table('Campaign',where=where,filters=filters)
        query='SELECT "Status" from public."Campaign" where "CampaignID"='+str(campaignid)+' and "StartDate" > now() + interval \'10 minutes\';'
        campaigns=get_query(query)
        if len(campaigns)==1:
            if campaigns[0]['Status']=='Scheduled':
                assert update_table('Campaign',where={'CampaignID':campaignid},filters={'Status':'Cancelled'})==1
            else:
                return make_response(jsonify({'Error':'Invalid'}), 500, headers)
        else:
            return make_response(jsonify({'Error':'Invalid'}), 500, headers)
        return make_response(jsonify({'Status':'OK'}), 200, headers)
    except Exception as e:
        return make_response(jsonify({'Error': str(e)}), 500, headers)

@controller_bp.route("/post/start/campaign",methods=["POST"])
#@login_required
def start_campaign():
    headers = {"Content-Type": "application/json"}
    CampaignID=int(request.form["CampaignID"])
    filters={"ModifiedBy":CreatedBy,
            "ModifiedDate":"now"
            }
    filters["Status"]="Scheduled"
    assert update_table('Campaign',where={'CampaignID':CampaignID},filters=filters)==1
    return make_response(jsonify({'Status': 'OK'}), 200, headers)

def get_campaign_groups(jinja=True):
    try:
        query="""SELECT "Group","Description","RecID","Status" FROM public."CampaignGroup"
         WHERE "OrganizationID"="""+str(current_user.OrganizationID) +""";"""
        data = pd.read_sql(query, connection)
        if jinja:
            data = json.loads(data.to_json(orient='records'))
        return data
    except Exception as e:
        return False
def get_target_groups(jinja=True):
    try:
        query="""SELECT "FarmerGroupID","GroupName","Description","Status" FROM public."FarmerGroup"
        WHERE "OrganizationID"="""+str(current_user.OrganizationID) +""";"""
        data = pd.read_sql(query, connection)
        if jinja:
            data = json.loads(data.to_json(orient='records'))
        return data
    except Exception as e:
        return False
def get_channels(jinja=True):
    try:
        query="""select "ChannelID","Channel","Description","Status" from public."Channels"
        WHERE "OrganizationID"="""+str(current_user.OrganizationID) +""";"""
        data = pd.read_sql(query, connection)
        if jinja:
            data = json.loads(data.to_json(orient='records'))
        return data
    except Exception as e:
        return False
def get_crops(jinja=True):
    try:
        query="""select "CropID","CropName","Description","CropCategory","CropSector","Duration","Status" from public."Crops"
        WHERE "OrganizationID"="""+str(current_user.OrganizationID) +""";"""
        data = pd.read_sql(query, connection)
        if jinja:
            data = json.loads(data.to_json(orient='records'))
        return data
    except Exception as e:
        return False
def get_farmers(jinja=True,filters=None):
    try:
        query="""SELECT a."FarmerID",a."FirstName",a."Gender" , a."LastName", a."IDNo", a."MobileNo", 
                    a."Geography",a."Status" , b.name "CreatedBy",a."FarmerGroupID", c."GroupName"
					as "FarmerGroupName" FROM public."Farmers" a LEFT JOIN public."expert-users" b
                    ON a."CreatedBy" = b.id left join public."FarmerGroup" c on 
					a."FarmerGroupID"=c."FarmerGroupID" WHERE a."OrganizationID"="""+str(current_user.OrganizationID)
        if filters:
            for key in filters:
                query=query + """ AND a.\""""+ key +"""\"="""+ str(filters[key]) + """ """
        query=query+""";"""
        data = pd.read_sql(query, connection)
        if jinja:
            data = json.loads(data.to_json(orient='records'))
        return data
    except Exception as e:
        return False
def get_farmers_oftuple(jinja=True,filters=None):
    # filter is dictionary with keys as DB column names and its values are tuple
    # but the tuple must match the data type of the DB column data type, otherwise ..|.
    try:
        query="""SELECT a."FarmerID",a."FirstName",a."Gender" , a."LastName", a."IDNo", a."MobileNo", 
                    a."Geography" , b.name "CreatedBy",a."FarmerGroupID", c."GroupName"
					as "FarmerGroupName" FROM public."Farmers" a LEFT JOIN public."expert-users" b
                    ON a."CreatedBy" = b.id left join public."FarmerGroup" c on 
					a."FarmerGroupID"=c."FarmerGroupID" WHERE a."OrganizationID"="""+str(current_user.OrganizationID)
        if filters:
            for key in filters:
                query=query + """ AND a.\""""+ key +"""\" in """+ str(filters[key]) + """ """
        query=query+""";"""
        if len(filters['IDNo'])==1:
            query=query[:-4]+');'
        data = pd.read_sql(query, connection)
        if jinja:
            data = json.loads(data.to_json(orient='records'))
        return data
    except Exception as e:
        return False
def get_farmer_crops(jinja=True,filters=None):
    try:
        query="""SELECT a."FarmerCropID",b."LastName" "LastName",c."CropName",
            COALESCE(to_char(a."DatePlanting", 'YYYY-MM-DD'), '') AS "DatePlanting"
            ,COALESCE(to_char(a."YieldDate", 'YYYY-MM-DD'), '') AS "YieldDate",a."LandType",a."SoilType",a."LandArea"
            FROM public."FarmerCrops" a LEFT JOIN public."Farmers" b ON a."FarmerID" = b."FarmerID" 
            LEFT JOIN public."Crops" c ON a."CropID" = c."CropID" 
            WHERE a."OrganizationID"="""+str(current_user.OrganizationID)
        if filters:
            for key in filters:
                query=query + """ AND a.\""""+ key +"""\"="""+ str(filters[key]) + """ """
        query=query+""";"""
        data = pd.read_sql(query, connection)
        if jinja:
            data = json.loads(data.to_json(orient='records'))
        return data
    except Exception as e:
        return False
def get_farmer_lands(jinja=True,filters=None):
    try:
        query="""SELECT a."FarmerLandID",b."LastName" "LastName",a."LandArea" ,
            a."LandType", a."District",a."Locality",a."OwnershipType",a."WaterSourceType",
            a."Latitude",a."Longitude",a."SoilType"
            FROM public."FarmerLands" a LEFT JOIN public."Farmers" b 
            ON a."FarmerID" = b."FarmerID" WHERE a."OrganizationID"="""+str(current_user.OrganizationID)
        if filters:
            for key in filters:
                query=query + """ AND a.\""""+ key +"""\"="""+ str(filters[key]) + """ """
        query=query+""";"""
        data = pd.read_sql(query, connection)
        if jinja:
            data = json.loads(data.to_json(orient='records'))
        return data
    except Exception as e:
        return False
def get_farmer_channels(jinja=True,filters=None):
    try:
        query="""SELECT a."FarmerChannelID",b."LastName" "LastName",
            a."ChannelName",a."Status"
            FROM public."FarmerChannelMapping" a LEFT JOIN public."Farmers" b 
            ON a."FarmerID" = b."FarmerID" WHERE a."OrganizationID"="""+str(current_user.OrganizationID)
        if filters:
            for key in filters:
                query=query + """ AND a.\""""+ key +"""\"="""+ str(filters[key]) + """ """
        query=query+""";"""
        data = pd.read_sql(query, connection)
        if jinja:
            data = json.loads(data.to_json(orient='records'))
        return data
    except Exception as e:
        return False
def get_farmer_form(jinja=True):
    query="""SELECT unnest(enum_range(NULL::"OwnershipType"));"""
    OwnershipType = pd.read_sql(query, connection)
    query="""SELECT unnest(enum_range(NULL::"WaterSourceType"));"""
    WaterSourceType = pd.read_sql(query, connection)
    query="""SELECT unnest(enum_range(NULL::"LandType"));"""
    LandType = pd.read_sql(query, connection)
    query="""SELECT unnest(enum_range(NULL::"SoilType"));"""
    SoilType = pd.read_sql(query, connection)
    if jinja:
        OwnershipType = json.loads(OwnershipType.to_json(orient='records'))
        WaterSourceType = json.loads(WaterSourceType.to_json(orient='records'))
        LandType = json.loads(LandType.to_json(orient='records'))
        SoilType = json.loads(SoilType.to_json(orient='records'))
    return OwnershipType,WaterSourceType,LandType,SoilType
def api_get_farmers(jinja=True,filters=None):
    try:
        query="""SELECT a."FarmerID",a."FirstName",a."Gender" , a."LastName", a."IDNo", a."MobileNo", 
                    a."Geography" FROM public."Farmers" a LEFT JOIN public."expert-users" b
                    ON a."CreatedBy" = b.id """
        if filters:
            temp =[]
            for key in filters:
                if type(filters[key])==str:
                    temp.append(""" a.\""""+ key +"""\"='"""+ str(filters[key])+"""'""")
                else:
                    temp.append(""" a.\""""+ key +"""\"="""+ str(filters[key]))
            query=query+" WHERE " + " AND ".join(temp)
        query=query+""";"""
        data = pd.read_sql(query, connection)
        if jinja:
            data = json.loads(data.to_json(orient='records'))
        return data
    except Exception as e:
        return False
def get_campaigns():
    try:
        query="""SELECT a."CampaignID", a."Name", a."Description", 
                COALESCE(to_char(a."CreatedDate", 'YYYY-MM-DD HH24:MI:SS'), '') AS "CreatedDate",
                COALESCE(to_char(a."StartDate", 'YYYY-MM-DD HH24:MI:SS'), '') AS "StartDate"
                ,a."Status",a."Group", c.name "InitiatedBy" 
                FROM public."Campaign" a LEFT JOIN public."expert-users" c ON a."CreatedBy"=c.id 
                WHERE a."Status"!='Deleted' and a."OrganizationID"="""+str(current_user.OrganizationID)+ """;"""
        data = pd.read_sql(query, connection)
        data = json.loads(data.to_json(orient='records'))
        return data
    except Exception as e:
        return False
def get_users():
    try:
        query="""SELECT id,name,email,role,"Status" FROM public."expert-users"
                 WHERE "OrganizationID"="""+str(current_user.OrganizationID) +""";"""
        data = pd.read_sql(query, connection)
        data = json.loads(data.to_json(orient='records'))
        return data
    except Exception as e:
        return False        
def get_crops_form(jinja=True):
    query="""SELECT unnest(enum_range(NULL::"CropCategory"));"""
    CropCategory = pd.read_sql(query, connection)
    query="""SELECT unnest(enum_range(NULL::"CropSector"));"""
    CropSector = pd.read_sql(query, connection)
    if jinja:
        CropCategory = json.loads(CropCategory.to_json(orient='records'))
        CropSector = json.loads(CropSector.to_json(orient='records'))
    return CropCategory,CropSector
def get_broadcast_log(jinja=True):
    try:
        query="""SELECT a."BrodcastID",b."CampaignID", b."Name", a."FarmerID", a."Channel", a."Status", 
        COALESCE(to_char(a."CreatedDate", 'YYYY-MM-DD HH24:MI:SS'), '') AS "CreatedDate"
        FROM public."BroadcastLog" a Left join public."Campaign" b on 
        a."CampaignID"=b."CampaignID" Where a."OrganizationID"="""+str(current_user.OrganizationID) +""";"""
        data = pd.read_sql(query, connection)
        data = json.loads(data.to_json(orient='records'))
        return data
    except Exception as e:
        return False
def get_tickets(jinja=True):
    try:
        query="""SELECT "TicketID","Category","Description","Status",
        "Requestername","Requesterchannel","AssignedtouserID","Dateclosed",
        COALESCE(to_char("Datecreated", 'YYYY-MM-DD HH24:MI:SS'), '') AS "Datecreated"
        FROM public."SupportTickets" Where "OrgID"="""+str(current_user.OrganizationID) +""";"""
        data = pd.read_sql(query, connection)
        data = json.loads(data.to_json(orient='records'))
        return data
    except Exception as e:
        return False

@ConnectionError
def add_campaign(Name=None, Description=None, Comments=None, CreatedBy=None, Status=None, TargetSelectionMode=None, StartDate=None, EndDate=None, Group=None,TargetGroupID=None,TagType=None,TagNames=None,TargetChannels=None,OrganizationID=None,OrganizationName=None):
    cursor=connection.cursor()
    query=""" INSERT INTO public."Campaign"(
	    "Name", "Description", "Comments", "CreatedBy", "Status", "TargetSelectionMode",
         "StartDate", "EndDate", "Group","TargetGroupID","TagType","TagNames","OrganizationID","OrganizationName")
	    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s) RETURNING "CampaignID"; """
    values=(Name, Description, Comments, CreatedBy, Status, TargetSelectionMode,
             StartDate, EndDate, Group,TargetGroupID, TagType, TagNames,OrganizationID,OrganizationName)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        CampaignID = cursor.fetchone()[0]
        for ChannelID in TargetChannels:
            assert add_TargetChannel(CampaignID=CampaignID,ChannelID=ChannelID,CreatedBy=CreatedBy,OrganizationID=OrganizationID,OrganizationName=OrganizationName,Status='Created')==1
        cursor.close()
        return CampaignID
    else:
        cursor.close()
        return {"Error":"Adding Campaign Error"}

@ConnectionError
def add_TargetChannel(CampaignID=None, ChannelID=None, Status=None, CreatedBy=None,ModifiedDate=None, ModifiedBy=None, OrganizationID=None, OrganizationName=None):
    cursor=connection.cursor()
    query="""INSERT INTO public."CampaignTargetChannel"(
    "CampaignID", "ChannelID", "Status", "CreatedBy",
    "ModifiedDate", "ModifiedBy", "OrganizationID", "OrganizationName") 
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s);"""
    values=(CampaignID, ChannelID, Status, CreatedBy,ModifiedDate, ModifiedBy, OrganizationID, OrganizationName)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Adding TargetChannel Error"}

@ConnectionError
def add_TargetList(CampaignID=None, FarmerID=None,FarmerName=None,CreatedBy=None, Status=None,ModifiedDate=None, ModifiedBy=None, OrganizationID=None, OrganizationName=None):
    cursor=connection.cursor()
    query="""INSERT INTO public."CampaignTargetList"(
	    "CampaignID", "FarmerID","FarmerName", "CreatedBy", "Status","ModifiedDate", "ModifiedBy",
         "OrganizationID", "OrganizationName")
	VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s);"""
    values=(CampaignID, FarmerID, FarmerName, CreatedBy, Status, ModifiedDate, ModifiedBy, OrganizationID, OrganizationName)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Adding TargetList Error"}

@ConnectionError
def add_broadcast(CampaignID=None, FarmerID=None,FarmerName=None,Channel=None, Status=None, CreatedBy=None, ModifiedDate=None, ModifiedBy=None, OrganizationID=None, OrganizationName=None):
    cursor=connection.cursor()
    query="""INSERT INTO public."BroadcastLog"(
	    "CampaignID", "FarmerID", "FarmerName", "Channel", "Status", "CreatedBy",
        "ModifiedDate", "ModifiedBy", "OrganizationID", "OrganizationName")
	VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);"""
    values=(CampaignID, FarmerID, FarmerName, Channel, Status, CreatedBy, ModifiedDate, ModifiedBy, OrganizationID, OrganizationName)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Adding Bradcast Error Error"}

@ConnectionError
def add_broadcast_large(data):
    data_columns = list(data)
    data_columns=['"'+i+'"' for i in data_columns]
    columns = ",".join(data_columns)
    values = "VALUES({})".format(",".join(["%s" for _ in data_columns]))
    insert_query = "INSERT INTO {} ({}) {}".format('public."BroadcastLog"',columns,values)
    cursor=connection.cursor()
    psycopg2.extras.execute_batch(cursor, insert_query, data.values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Adding Campaign Media Error"}

@ConnectionError
def add_farmer(FirstName=None, LastName=None, Gender=None, DOB=None, IDType=None, IDNo=None, MobileNo=None, Email=None, LandArea=None, FarmingType=None, SoilType=None, Location=None, Region=None, Country=None, PinCode=None, CreatedBy=None,ModifiedDate=None,
    ModifiedBy=None, Status=None, OrganizationID=None, OrganizationName=None, FarmerGroupID=None, Geography=None,InsertedThrough=None,get_farmerid=False):
    cursor=connection.cursor()
    query="""INSERT INTO public."Farmers"(
    "FirstName", "LastName", "Gender", "DOB", "IDType", "IDNo", "MobileNo","Email", "LandArea",
    "FarmingType", "SoilType", "Location", "Region", "Country", "PinCode", "CreatedBy","ModifiedDate",
    "ModifiedBy", "Status", "OrganizationID", "OrganizationName", "FarmerGroupID", "Geography","InsertedThrough") 
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s ,%s, %s, %s, %s, %s,%s,%s,%s) RETURNING "FarmerID" """
    values=(FirstName, LastName, Gender, DOB, IDType, IDNo, MobileNo, Email, LandArea,
    FarmingType, SoilType, Location, Region, Country, PinCode, CreatedBy, ModifiedDate,
    ModifiedBy, Status, OrganizationID, OrganizationName, FarmerGroupID, Geography,InsertedThrough)
    cursor.execute(query,values)
    connection.commit()
    if get_farmerid and cursor.rowcount==1:
        FarmerID = cursor.fetchone()[0]
        cursor.close()
        return FarmerID
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Creating Farmer Error"}

@ConnectionError
def add_farmer_fromexcel_returnid(data,CreatedBy,OrganizationID,OrganizationName):
    try:
        data['OrganizationID']=OrganizationID
        data['CreatedBy']=CreatedBy
        data['OrganizationName']=OrganizationName
        data['InsertedThrough']='Excel'
        data_columns = list(data)
        data_columns=['"'+i+'"' for i in data_columns]
        columns = ",".join(data_columns)
        values = "VALUES %s returning \"FarmerID\""
        insert_query = "INSERT INTO {} ({}) {}".format('public."Farmers"',columns,values)
        data_list=[tuple(i) for i in data.values]
        cursor=connection.cursor()
        ids=psycopg2.extras.execute_values(cursor,insert_query,data_list,fetch=True)
        connection.commit()
        if cursor.rowcount>0:
            cursor.close()
            return [i[0] for i in ids]
        else:
            cursor.close()
            return {"Error":"Adding Farmers Excel Error"}
    except Exception as e:
        return False

@ConnectionError
def add_farmerchannel(Channel,GUID,ConversationID,OrganizationID,CreatedBy,OrganizationName=None):
    cursor=connection.cursor()
    query="""select "ChannelID","Channel","Description" from public."Channels"
        WHERE "OrganizationID"="""+str(OrganizationID) +""";"""
    channels = pd.read_sql(query, connection)
    ChannelID=int(channels.loc[channels['Channel'] == Channel]['ChannelID'])
    query="""INSERT INTO public."FarmerChannelMapping" (
         "ChannelID","ChannelName","GUID","ConversationID","CreatedBy","OrganizationID","OrganizationName")
        VALUES (%s,%s,%s,%s,%s,%s,%s) """
    values=(ChannelID,Channel,GUID,ConversationID,CreatedBy,OrganizationID,OrganizationName)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Mapping Farmer Channel Error"}

def upload_farmer_excel(path):
    # columns=tuple(read_csv(path,index_col=0,nrows=1).keys())
    columns=('FirstName','LastName','IDNo','MobileNo','Geography','CreatedBy','OrganizationID','OrganizationName','FarmerGroupID')
    cursor=connection.cursor()
    cursor.copy_from(file=path,table='Farmers',columns=columns,sep=',',null='')

@ConnectionError
def add_farmer_crop(filters):
    cursor=connection.cursor()
    query="""INSERT INTO public."FarmerCrops"("""
    query_values=""" VALUES ("""
    values=[]
    for key in filters:
        query=query+"""\""""+key+"""\","""
        query_values=query_values+"""%s,"""
        values.append(filters[key])
    query=query[:len(query)-1]+""")""" + query_values[:len(query_values)-1]+""")"""
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Creating Farmer Crop Error"}

@ConnectionError
def add_farmer_land(filters):
    cursor=connection.cursor()
    query="""INSERT INTO public."FarmerLands"("""
    query_values=""" VALUES ("""
    values=[]
    for key in filters:
        query=query+"""\""""+key+"""\","""
        query_values=query_values+"""%s,"""
        values.append(filters[key])
    query=query[:len(query)-1]+""")""" + query_values[:len(query_values)-1]+""")"""
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Creating Farmer Land Error"}

@ConnectionError
def add_campaign_media(CampaignID,MediaType,Data,CreatedBy,OrganizationID,OrganizationName=None):
    cursor=connection.cursor()
    query="""INSERT INTO public."CampaignMedia"(
	"CampaignID","MediaType", "Data", "CreatedBy", "OrganizationID", "OrganizationName")
	VALUES (%s,%s,%s,%s,%s,%s);"""
    values=(CampaignID,MediaType,Data,CreatedBy,OrganizationID,OrganizationName)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Adding Campaign Media Error"}

def add_targerlist_from_farmergroup(CampaignID,TargetGroupID,CreatedBy,OrganizationID,OrganizationName=None):
    try:
        query="""SELECT "FarmerID","LastName" as "FarmerName" FROM public."Farmers"
        WHERE "OrganizationID"="""+str(OrganizationID)+""" and "FarmerGroupID"= """+str(TargetGroupID) +""";"""
        data = pd.read_sql(query, connection)

        data['CampaignID']=CampaignID
        data['OrganizationID']=OrganizationID
        data['CreatedBy']=CreatedBy
        data['OrganizationName']=OrganizationName

        data_columns = list(data)
        data_columns=['"'+i+'"' for i in data_columns]
        columns = ",".join(data_columns)
        values = "VALUES({})".format(",".join(["%s" for _ in data_columns]))
        insert_query = "INSERT INTO {} ({}) {}".format('public."CampaignTargetList"',columns,values)
        cursor=connection.cursor()
        psycopg2.extras.execute_batch(cursor, insert_query, data.values)
        connection.commit()
        if cursor.rowcount==1:
            cursor.close()
            return 1
        else:
            cursor.close()
            return {"Error":"Adding Campaign Media Error"}
    except Exception as e:
        return False

@ConnectionError
def add_campaign_targetlist(CampaignID,FarmerID,FarmerName,CreatedBy,OrganizationID,OrganizationName=None):
    cursor=connection.cursor()
    query="""INSERT INTO public."CampaignTargetList"(
	"CampaignID", "FarmerID","FarmerName", "CreatedBy", "OrganizationID", "OrganizationName")
	VALUES (%s,%s,%s,%s,%s,%s);"""
    values=(CampaignID,FarmerID,FarmerName,CreatedBy,OrganizationID,OrganizationName)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Adding Campaign Media Error"}

@ConnectionError
def add_crop(filters):
    cursor=connection.cursor()
    query="""INSERT INTO public."Crops"("""
    query_values=""" VALUES ("""
    values=[]
    for key in filters:
        query=query+"""\""""+key+"""\","""
        query_values=query_values+"""%s,"""
        values.append(filters[key])
    query=query[:len(query)-1]+""")""" + query_values[:len(query_values)-1]+""")"""
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Creating Crop Error"}

@ConnectionError
def add_cropcategory(name):
    cursor=connection.cursor()
    query="""ALTER TYPE "CropCategory" ADD VALUE %s"""
    values=(name,)
    cursor.execute(query,values)
    connection.commit()
    cursor.close()
    return 1

@ConnectionError
def add_cropsector(name):
    cursor=connection.cursor()
    query="""ALTER TYPE "CropSector" ADD VALUE %s"""
    values=(name,)
    cursor.execute(query,values)
    connection.commit()
    cursor.close()
    return 1

@ConnectionError
def update_crop(CropID,filters):
    cursor=connection.cursor()
    query="""UPDATE public."Crops" SET """
    values=[]
    for key in filters:
        query=query+"""\""""+key+"""\"=%s,"""
        values.append(filters[key])
    query=query[:len(query)-1]
    query=query+ """ WHERE "CropID"=%s;"""
    values.append(CropID)
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Updating Crop Error"}

@ConnectionError
def add_channel(filters):
    cursor=connection.cursor()
    query="""INSERT INTO public."Channels"("""
    query_values=""" VALUES ("""
    values=[]
    for key in filters:
        query=query+"""\""""+key+"""\","""
        query_values=query_values+"""%s,"""
        values.append(filters[key])
    query=query[:len(query)-1]+""")""" + query_values[:len(query_values)-1]+""")"""
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Creating Channel Error"}

@ConnectionError
def update_channel(ChannelID,filters):
    cursor=connection.cursor()
    query="""UPDATE public."Channels" SET """
    values=[]
    for key in filters:
        query=query+"""\""""+key+"""\"=%s,"""
        values.append(filters[key])
    query=query[:len(query)-1]
    query=query+ """ WHERE "ChannelID"=%s;"""
    values.append(ChannelID)
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Updating Channel Error"}

@ConnectionError
def update_farmer(FarmerID,filters):
    cursor=connection.cursor()
    query="""UPDATE public."Farmers" SET """
    values=[]
    for key in filters:
        query=query+"""\""""+key+"""\"=%s,"""
        values.append(filters[key])
    query=query[:len(query)-1]
    query=query+ """ WHERE "FarmerID"=%s;"""
    values.append(FarmerID)
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Updating farmer Error"}

@ConnectionError
def update_farmerchannel(Guid,filters):
    cursor=connection.cursor()
    query="""UPDATE public."FarmerChannelMapping" SET """
    values=[]
    for key in filters:
        query=query+"""\""""+key+"""\"=%s,"""
        values.append(filters[key])
    query=query[:len(query)-1]
    query=query+ """ WHERE "GUID"=%s;"""
    values.append(Guid)
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Updating farmer Channel Error"}

@ConnectionError
def update_farmer_crop(FarmerCropID,filters):
    cursor=connection.cursor()
    query="""UPDATE public."FarmerCrops" SET """
    values=[]
    for key in filters:
        query=query+"""\""""+key+"""\"=%s,"""
        values.append(filters[key])
    query=query[:len(query)-1]
    query=query+ """ WHERE "FarmerCropID"=%s;"""
    values.append(FarmerCropID)
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Updating farmer Crop Error"}

@ConnectionError
def update_farmer_land(FarmerLandID,filters):
    cursor=connection.cursor()
    query="""UPDATE public."FarmerLands" SET """
    values=[]
    for key in filters:
        query=query+"""\""""+key+"""\"=%s,"""
        values.append(filters[key])
    query=query[:len(query)-1]
    query=query+ """ WHERE "FarmerLandID"=%s;"""
    values.append(FarmerLandID)
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Updating farmer Land Error"}

@ConnectionError
def update_targetchannel(CampaignTargetChannelID,filters):
    cursor=connection.cursor()
    query="""UPDATE public."CampaignTargetChannel" SET """
    values=[]
    for key in filters:
        query=query+"""\""""+key+"""\"=%s,"""
        values.append(filters[key])
    query=query[:len(query)-1]
    query=query+ """ WHERE "CampaignTargetChannelID"=%s;"""
    values.append(CampaignTargetChannelID)
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Updating Campaign Target Channel Error"}

@ConnectionError
def update_campaign(CampaignID,filters):
    cursor=connection.cursor()
    query="""UPDATE public."Campaign" SET """
    values=[]
    for key in filters:
        query=query+"""\""""+key+"""\"=%s,"""
        values.append(filters[key])
    query=query[:len(query)-1]
    query=query+ """ WHERE "CampaignID"=%s;"""
    values.append(CampaignID)
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Updating farmer Land Error"}

@ConnectionError
def add_farmergroup(filters):
    cursor=connection.cursor()
    query="""INSERT INTO public."FarmerGroup"("""
    query_values=""" VALUES ("""
    values=[]
    for key in filters:
        query=query+"""\""""+key+"""\","""
        query_values=query_values+"""%s,"""
        values.append(filters[key])
    query=query[:len(query)-1]+""")""" + query_values[:len(query_values)-1]+""")"""
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Creating Farmer Group Error"}

@ConnectionError
def update_farmergroup(FarmerGroupID,filters):
    cursor=connection.cursor()
    query="""UPDATE public."FarmerGroup" SET """
    values=[]
    for key in filters:
        query=query+"""\""""+key+"""\"=%s,"""
        values.append(filters[key])
    query=query[:len(query)-1]
    query=query+ """ WHERE "FarmerGroupID"=%s;"""
    values.append(FarmerGroupID)
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Updating Farmer group Error"}

@ConnectionError
def add_campaigngroup(filters):
    cursor=connection.cursor()
    query="""INSERT INTO public."CampaignGroup"("""
    query_values=""" VALUES ("""
    values=[]
    for key in filters:
        query=query+"""\""""+key+"""\","""
        query_values=query_values+"""%s,"""
        values.append(filters[key])
    query=query[:len(query)-1]+""")""" + query_values[:len(query_values)-1]+""")"""
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Creating Campaign Group Error"}

@ConnectionError
def update_campaigngroup(RecID,filters):
    cursor=connection.cursor()
    query="""UPDATE public."CampaignGroup" SET """
    values=[]
    for key in filters:
        query=query+"""\""""+key+"""\"=%s,"""
        values.append(filters[key])
    query=query[:len(query)-1]
    query=query+ """ WHERE "RecID"=%s;"""
    values.append(RecID)
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return {"Error":"Updating Crop Error"}

def initiate_campaign(CampaignID,CreatedBy,OrganizationID,OrganizationName=None):
    #getting target channel
    query='SELECT b."Channel",a."CampaignTargetChannelID" FROM public."CampaignTargetChannel"\
            a left join public."Channels" b on a."ChannelID"=b."ChannelID"  where a."CampaignID"='+ str(CampaignID)+';'
    data = pd.read_sql(query, connection)
    TargetChannelData=data
    channels=list(data['Channel'])
    #getting media data
    query='Select "MediaType","Data" from public."CampaignMedia" where "CampaignID"='+ str(CampaignID)+';'
    media = pd.read_sql(query, connection)
    fileName=''
    fileData=''
    message=''
    WhatsappData=''
    if 'https' in list(media.Data)[0]:
        fileData=list(media.Data)[0]
        fileName=fileData.split('/')[len(fileData.split('/'))-1:][0]
        response = requests.get(fileData)
        ext=fileName.split('.')[-1]
        if ext.lower() in ('jpg','jpeg','png','tif','gif'):
            content_type='image/'+ext
        elif ext.lower() in ('avi','mp4'):
            content_type='video/'+ext
        elif ext.lower() in ('wav','mp3','flac'):
            content_type='audio/'+ext
        else:
            if ext=='pdf':
                content_type = 'application/pdf'
            elif ext=='csv':
                content_type = 'text/csv'
            elif ext=='xls':
                content_type = 'application/vnd.ms-excel'
            elif ext=='xlsx':
                content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            elif ext=='docx':
                content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            elif ext=='doc':
                content_type = 'application/msword'
            else:
                content_type = response.headers["content-type"]
        encoded_body = base64.b64encode(response.content)
        WhatsappData="data:{};base64,{}".format(content_type, encoded_body.decode())    
    else:
        soup = BeautifulSoup(list(media.Data)[0])
        message=soup.get_text()
        message= unicodedata.normalize("NFKD",message).replace('\n','')
    #Hard Coded
    # SMS Channel Only
    try:
        if 'SMS' in channels:
            SMSID=int(list(TargetChannelData[TargetChannelData['Channel']=='SMS']['CampaignTargetChannelID'])[0])
            assert update_targetchannel(SMSID,{'Status':'InProgress'})==1
            query='Select a."FarmerID",a."FarmerName", b."MobileNo" ,c."GUID" from public."CampaignTargetList"\
                a left join public."Farmers" b on a."FarmerID"=b."FarmerID"\
                left join public."FarmerChannelMapping" c on a."FarmerID"=c."FarmerID" where a."CampaignID"='+ str(CampaignID)+';'
            temp_data = pd.read_sql(query, connection)
            if len(temp_data)==0:
                assert update_targetchannel(SMSID,{'Status':'Cancelled','Comments':'Empty Target List'})==1
            else:
                MobileNos=list(map(str,list(temp_data.MobileNo)))
                MobileNos=list(set(MobileNos))
                temp_data['Channel']='SMS'
                assert list(media.MediaType)[0] =='Text'
                
                resp=api_campaign(MobileNos=MobileNos,channelType='sms',message=message)
                
                temp_data=response_processor(temp_data,resp,'MobileNo',CampaignID,OrganizationID,CreatedBy,OrganizationName)
                assert add_broadcast_large(temp_data)==1
                assert update_targetchannel(SMSID,{'Status':'Completed'})==1
    except Exception as e:
        assert update_targetchannel(SMSID,{'Status':'Error','Comments':str(e)})==1
    # Whatsapp
    try:
        if 'Whatsapp' in channels:
            WhatsappID=int(list(TargetChannelData[TargetChannelData['Channel']=='Whatsapp']['CampaignTargetChannelID'])[0])
            assert update_targetchannel(WhatsappID,{'Status':'InProgress'})==1
            query='Select a."FarmerID",a."FarmerName", b."MobileNo" ,c."GUID" from public."CampaignTargetList"\
                a left join public."Farmers" b on a."FarmerID"=b."FarmerID"\
                left join public."FarmerChannelMapping" c on a."FarmerID"=c."FarmerID" where a."CampaignID"='+ str(CampaignID)+';'
            temp_data = pd.read_sql(query, connection)
            if len(temp_data)==0:
                assert update_targetchannel(WhatsappID,{'Status':'Cancelled','Comments':'Empty Target List'})==1
            else:
                MobileNos=list(map(str,list(temp_data.MobileNo)))
                MobileNos=list(set(MobileNos))
                temp_data['Channel']='Whatsapp'
                resp=api_campaign(MobileNos=MobileNos,channelType='whatsapp',message=message,fileName=fileName,fileData=WhatsappData)
                
                temp_data=response_processor(temp_data,resp,'MobileNo',CampaignID,OrganizationID,CreatedBy,OrganizationName)
                assert add_broadcast_large(temp_data)==1
                assert update_targetchannel(WhatsappID,{'Status':'Completed'})==1
    except Exception as e:
        assert update_targetchannel(WhatsappID,{'Status':'Error','Comments':str(e)})==1
    # FB
    try:
        if 'Facebook Messenger' in channels:
            MessengerID=int(list(TargetChannelData[TargetChannelData['Channel']=='Facebook Messenger']['CampaignTargetChannelID'])[0])
            assert update_targetchannel(MessengerID,{'Status':'InProgress'})==1
            query="""Select a."FarmerID",a."FarmerName", b."MobileNo" ,c."GUID" from public."CampaignTargetList"
                a left join public."Farmers" b on a."FarmerID"=b."FarmerID"
                left join public."FarmerChannelMapping" c on a."FarmerID"=c."FarmerID" where a."CampaignID"="""+ str(CampaignID)+""" and c."ChannelName"= 'Facebook Messenger' ;"""
            temp_data = pd.read_sql(query, connection)
            if len(temp_data)==0:
                assert update_targetchannel(MessengerID,{'Status':'Cancelled','Comments':'Empty Target List'})==1
            else:
                GUID=list(map(str,list(temp_data.GUID)))
                temp_data['Channel']='Facebook Messenger'
                resp=api_campaign(MobileNos=GUID,channelType='facebook',message=message,fileName=fileName,fileData=fileData)
                
                temp_data=response_processor(temp_data,resp,'GUID',CampaignID,OrganizationID,CreatedBy,OrganizationName)
                assert add_broadcast_large(temp_data)==1
                assert update_targetchannel(MessengerID,{'Status':'Completed'})==1
    except Exception as e:
        assert update_targetchannel(MessengerID,{'Status':'Error','Comments':str(e)})==1
    # Telegram
    try:
        if 'Telegram' in channels:
            TelegramID=int(list(TargetChannelData[TargetChannelData['Channel']=='Telegram']['CampaignTargetChannelID'])[0])
            assert update_targetchannel(TelegramID,{'Status':'InProgress'})==1
            query="""Select a."FarmerID",a."FarmerName", b."MobileNo" ,c."GUID" from public."CampaignTargetList"
                a left join public."Farmers" b on a."FarmerID"=b."FarmerID"
                left join public."FarmerChannelMapping" c on a."FarmerID"=c."FarmerID" where a."CampaignID"="""+ str(CampaignID)+""" and c."ChannelName"= 'Telegram' ;"""
            temp_data = pd.read_sql(query, connection)
            if len(temp_data)==0:
                assert update_targetchannel(TelegramID,{'Status':'Cancelled','Comments':'Empty Target List'})==1
            else:
                GUID=list(map(str,list(temp_data.GUID)))
                temp_data['Channel']='Telegram'
                resp=api_campaign(MobileNos=GUID,channelType='telegram',message=message,fileName=fileName,fileData=fileData)
                temp_data=response_processor(temp_data,resp,'GUID',CampaignID,OrganizationID,CreatedBy,OrganizationName)
                assert add_broadcast_large(temp_data)==1
                assert update_targetchannel(TelegramID,{'Status':'Completed'})==1
    except Exception as e:
        assert update_targetchannel(TelegramID,{'Status':'Error','Comments':str(e)})==1
    # Microsoft Teams
    try:
        if 'Microsoft Teams' in channels:
            TeamsID=int(list(TargetChannelData[TargetChannelData['Channel']=='Microsoft Teams']['CampaignTargetChannelID'])[0])
            assert update_targetchannel(TeamsID,{'Status':'InProgress'})==1
            query="""Select a."FarmerID",a."FarmerName", b."MobileNo" ,c."GUID" from public."CampaignTargetList"
                a left join public."Farmers" b on a."FarmerID"=b."FarmerID"
                left join public."FarmerChannelMapping" c on a."FarmerID"=c."FarmerID" where a."CampaignID"="""+ str(CampaignID)+""" and c."ChannelName"= 'Microsoft Teams' ;"""
            temp_data = pd.read_sql(query, connection)
            if len(temp_data)==0:
                assert update_targetchannel(TeamsID,{'Status':'Cancelled','Comments':'Empty Target List'})==1
            else:
                GUID=list(map(str,list(temp_data.GUID)))
                temp_data['Channel']='Microsoft Teams'
                resp=api_campaign(MobileNos=GUID,channelType='Microsoft Teams',message=message,fileName=fileName,fileData=fileData)
                temp_data=response_processor(temp_data,resp,'GUID',CampaignID,OrganizationID,CreatedBy,OrganizationName)
                assert add_broadcast_large(temp_data)==1
                assert update_targetchannel(TeamsID,{'Status':'Completed'})==1
    except Exception as e:
        assert update_targetchannel(TeamsID,{'Status':'Error','Comments':str(e)})==1
    return 1

def response_processor(data,resp,map_key,CampaignID,OrganizationID,CreatedBy,OrganizationName):
    #Hard Coded
    a=eval(resp)
    if map_key!='GUID':
        a={int(k):v for k,v in a.items()}
    temp={}
    for i in a:
        if a[i].lower()=='true':
            a[i]='Completed'
            temp[i]=''
        else:
            temp[i]=a[i]
            a[i]='Error'
    data['Status']=data[map_key].map(a)
    data['Comments']=data[map_key].map(temp)
    data=data.drop(['MobileNo'],axis=1)
    data=data.drop(['GUID'],axis=1)
    data['CampaignID']=CampaignID
    data['OrganizationID']=OrganizationID
    data['CreatedBy']=CreatedBy
    data['OrganizationName']=OrganizationName
    return data

def api_campaign(MobileNos,channelType,message='',fileName='',fileData=''):
    url = "https://dardlea.azurewebsites.net/api/Senddata/SendBulkSMS"
    
    temp = {"GUIDorMobilenumber":MobileNos,"message":message,"channelType":channelType,
    "fileData":fileData,"fileName":fileName}
    payload=str(temp).replace("'",'"')
    headers = {
    'Content-Type': 'application/json'
    }
    
    response = requests.request("POST", url, headers=headers, data = payload)
    resp=response.text.encode('utf8')
    return resp

def notification_handler(header,text,typ):
    #type success,error,warning,info
    index=len(notifications)
    notifications[index]={'header':header,
                          'text':text,
                          'type':typ}
    return 1

@ConnectionError
def insert_table(table,data,CreatedBy,OrganizationID,OrganizationName=None):
    try:
        data['OrganizationID']=OrganizationID
        data['CreatedBy']=CreatedBy
        data['OrganizationName']=OrganizationName

        data_columns = list(data)
        data_columns=['"'+i+'"' for i in data_columns]
        columns = ",".join(data_columns)
        values = "VALUES({})".format(",".join(["%s" for _ in data_columns]))
        insert_query = "INSERT INTO {} ({}) {}".format('public."' +table + '"',columns,values)
        cursor=connection.cursor()
        psycopg2.extras.execute_batch(cursor, insert_query, data.values)
        connection.commit()
        if cursor.rowcount==1:
            cursor.close()
            return 1
        else:
            cursor.close()
            return {"Error":"Adding Farmers Excel Error"}
    except Exception as e:
        return False

@ConnectionError
def update_table(table,where,filters):
    cursor=connection.cursor()
    query='UPDATE public."'+table +'" SET '
    values=[]
    for key in filters:
        query=query+'"'+key+'"=%s,'
        values.append(filters[key])
    query=query[:len(query)-1]
    for key in where:
        query=query+ ' WHERE "' + key +'"=%s and '
        values.append(where[key])
    query=query[:len(query)-4]
    query=query+';'
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==1:
        cursor.close()
        return 1
    else:
        cursor.close()
        return 0

'''
table = table name
where = Default None, 
       data type dictionary where condition parameters
       keys should be exactly same as the column names in DB
where_str = keys of where dictionary
filters= data type list
        default *
        give all the column names you want to include in the data response
ex. where={'CampaignID':1,'FirstName':'Vageeshan'}
    where_str=['FirstName']
    "select * from farmers where FirstName='vageeshan' and CampaignID='1'"
    
'''
@ConnectionError
def get_table(table,where=None,where_str=[],filters=None,jinja=True):
    query='SELECT '
    if filters is None:
        query=query+'*'
    else:
        for key in filters:
            query=query+'"'+key+'",'
        query=query[:len(query)-1]
    query=query+' from public."'+table +'"'
    if where:
        query=query+' WHERE '
        for key in where:
            if key in where_str:
                query=query+ ' "' + key +'"=\''+where[key]+'\' and '
            else:
                query=query+ ' "' + key +'"='+str(where[key])+' and '
        query=query[:len(query)-4]
    query=query+';'
    data = pd.read_sql(query, connection)
    if jinja:
        data = json.loads(data.to_json(orient='records'))
    return data

@ConnectionError
def delete_rows(table,where):
    cursor=connection.cursor()
    query='DELETE from public."'+table +'" WHERE '
    values=[]
    for key in where:
        query=query+ ' "' + key +'"=%s and '
        values.append(where[key])
    query=query[:len(query)-4]
    query=query+';'
    values=tuple(values)
    cursor.execute(query,values)
    connection.commit()
    if cursor.rowcount==-1:
        cursor.close()
        return 0
    else:
        cursor.close()
        return 1

@ConnectionError
def get_query(query,jinja=True):
    data=pd.read_sql(query,connection)
    if jinja:
        data=json.loads(data.to_json(orient='records'))
    return data

def get_dob(dob):
    dob=datetime.strptime(dob, '%y%m%d')
    if dob > datetime.now():
       dob=dob.replace(year=dob.year-100) 
    return dob

def check_edit_campaign(campid):
    query='Select * from public."Campaign" where "CampaignID"='+str(campid)+' and "Status"=\'Created\' '
    data=pd.read_sql(query,connection)
    if len(data):
        return True
    return False
