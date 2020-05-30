loginButton = document.getElementById("auth-button");
console.log(loginButton);
loginButton.addEventListener("click", authorise);

CLIENT_ID = "";  // your apps client id which is registered in spotify dashboard
REDIRECT_URI = ""; // redirect link which u provided while registering ur app

token = window.location.hash.substr(1).split("&")[0].split("=")[1];
if (token) {
  window.opener.spotifyCallBack(token);
}

var total = 0;

function getLoginURl(scopes) {
  return (
    "https://accounts.spotify.com/authorize?client_id=" +
    CLIENT_ID +
    "&redirect_uri=" +
    encodeURIComponent(REDIRECT_URI) +
    "&scope=" +
    encodeURIComponent(scopes.join(" ")) +
    "&response_type=token"
  );
}

function authorise(event) {
  button = event.target;
  
  var url = getLoginURl([
    "user-read-email",
    "user-read-private",
    "user-library-read",
  ]);

  var width = 800,
    height = 600,
    left = screen.width / 2 - width / 2,
    top = screen.height / 2 - height / 2;

  console.log("start");
  var w = window.open(
    url,
    "Spotify",
    "width=" + width + ", height=" + height + ", top=" + top + ", left=" + left
  );

  window.spotifyCallBack = (payload) => {
    button.style.visibility = "hidden";
    token = payload;
    console.log(token);
    w.close();
    getData(token);

    var title = document.createElement("div");
    var songs = document.getElementsByClassName("songs")[0];
    title.innerHTML = "Songs that you liked:";
    songs.append(title);

    tracksData(token, 50, 0);
  };

  function getData(access_token) {
    $.ajax({
      url: "https://api.spotify.com/v1/me",
      headers: {
        Authorization: "Bearer " + access_token,
      },
      contentType: "application/json",
    }).done(function (response) {
      console.log(response["display_name"]);
      console.log(response["email"]);
      console.log(response["id"]);
      var name = document.createElement("div");
      var details = document.getElementsByClassName("details")[0];
      name.innerHTML = "Name: " + response["display_name"];
      details.append(name);
      var email = document.createElement("div");
      email.innerHTML = "Email: " + response["email"];
      details.append(email);
      var id = document.createElement("div");
      id.innerHTML = "ID: " + response["id"];
      details.append(id);
    });
  }
}

function tracksData(access_token, limit, offset) {
  $.ajax({
    url: "https://api.spotify.com/v1/me/tracks",
    headers: {
      Authorization: "Bearer " + access_token,
    },
    data: {
      limit: limit,
      offset: offset,
    },
    type: "GET",
  }).done(function (response) {
    console.log(response["items"].length);
    if (response["items"].length == 0) {
      console.log(total);
      alert("You have total of " + total + " liked songs");
      return;
    }
    songs = document.getElementsByClassName("songs")[0];
    for (var i = 0; i < response["items"].length; i++) {
      console.log(response["items"][i]["track"]["name"]);
      var song = document.createElement("div");
      song.innerHTML = response["items"][i]["track"]["name"];
      songs.append(song);
    }
    total = total + response["items"].length;
    tracksData(access_token, 50, offset + 50);
  });

}

//curl -X GET "https://api.spotify.com/v1/me/tracks" -H "Authorization: Bearer 'access token'"
