import requests
import json
from datetime import datetime

firebase_url = 'https://us-central1-dadjokeapi.cloudfunctions.net'


# import jokes from jokes.json file
with open('jokes.json') as json_file:
    jokes = json.load(json_file)

headers = {"Content-Type": "application/json; charset=utf-8"}

# iterate through jokes and upload to firebase
id = 0
for joke in jokes:
    # create dictionary to be uploaded
    id += 1
    data = {
        'id': str(id).zfill(4),
        'joke': joke,
        'datetime': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    # check if joke already exists by id
    # result = requests.get(f'{firebase_url}/getJokeById?id={id}')
    # if result.status_code == 404:
    
    if 5 > 4:
        # upload data to firebase
        result = requests.post(f'{firebase_url}/saveJoke', json=data, headers=headers)

        # print result
        print(result)
        print(result.text)
        # if status code is not 200, stop uploading
        if result.status_code != 201:
            break

        print(result.json())