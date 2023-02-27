import flask
from flask import Flask
from oauth import OAuth
from pymongo import MongoClient

app = Flask(__name__)
app.config["SECRET_KEY"] = "SHLOKWASHERE"

cluster = MongoClient("connect")
db = cluster["times"]
collection = db["times"]


@app.route("/")
def home():
    return flask.render_template("index.html", discord_url=OAuth.discord_login_url)


@app.route("/timer")
def timer():
    code = flask.request.args.get("code")
    print(code)
    access_token = OAuth.get_access_token(code)
    print(access_token)
    if not access_token:
        return flask.redirect("http://127.0.0.1:5000")
    flask.session["token"] = access_token

    user = OAuth.get_user_json(access_token)
    print(type(user))

    return flask.render_template("dashboard.html", id=user.get("id"))


@app.route("/export-times/<user_id>/<category>/<times>")
def export_times(user_id, category, times):
    print(user_id, category)

    times = (times.strip()).split("-")
    times = [float(i) for i in times]
    user_data = collection.find({"_id": user_id})
    uID = False

    for data in user_data:
        if data:
            uID = True
    if uID:
        if category in collection.find_one({"_id": user_id}):
            result = collection.find_one({"_id" : user_id})[category]

            print("Current type: " + str(type(times[0])))
            print("Database type: " + str(type(result[0])))
            current = result
            current = current + times
            collection.update_one({"_id" : user_id}, {"$set" : {f"{category}" : current}})
        else:
            collection.update_one({"_id" : user_id}, {"$set" : {f"{category}" : times}})
    else:
        collection.insert_one({"_id": user_id, f"{category}": times})

    return True


if __name__ == "__main__":
    app.run(debug=False)
