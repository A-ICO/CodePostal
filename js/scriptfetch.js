$("#btnRechercher").on("click", function () {

    fetch("http://api.zippopotam.us/fr/" + $("#postcode").val())
        .then(response => response.json())
        .then(response => {
            console.log(response);
            var fluxHtml = "";
            for (var i = 0; i < response.places.length; i++) {
                fluxHtml += "<option id=" + (i + 1) + ">" + response['places'][i]['place name'] + "</option>";
            }
            $("#inputGroupSelect03").empty();
            $("#inputGroupSelect03").append(fluxHtml);
        })
        .catch(error => {
            error = "Erreur dans votre requête AJAX !!!";
            console.log("Erreur : " + error)
        });
});




