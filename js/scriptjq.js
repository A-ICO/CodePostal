$("#btnRechercher").on("click", function () {

    var fluxHtml = "";

    $.ajax({

        url: "http://api.zippopotam.us/fr/" + $("#inputCodePostal").val(),
        type: "GET",
        datatype: "JSON",

        success: function (dataJson) {

            console.log(dataJson);

            for (var i = 0; i < dataJson.places.length; i++) {
                fluxHtml += "<option id=" + (i + 1) + ">" + dataJson['places'][i]['place name'] + "</option>";
            }
            $("#selectCommune").html(fluxHtml);
        },
        error: function (erreur) {
            erreur = "Erreur dans votre requête AJAX !!!";
            alert("Erreur : " + erreur);
        }

    });

});

