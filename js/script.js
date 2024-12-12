$(document).ready(function () {
    // Recherche par code postal (départements)
    $("#btnRechercher").on("click", async function () {
        try {
            const response = await fetch("http://api.zippopotam.us/fr/" + $("#postcode").val());
            if (response.status === 200) {
                const data = await response.json();
                let options = "";
                data.places.forEach((place, index) => {
                    options += `<option id="${index + 1}">${place['place name']}</option>`;
                });
                $("#inputGroupSelect03").empty().append(options);
            } else {
                alert("Code postal introuvable !");
            }
        } catch (error) {
            console.error("Erreur lors de la recherche du département :", error);
            alert("Une erreur est survenue lors de la recherche.");
        }
    });

    // Recherche par pays
    const countryResultsElement = $("#countryResults");
    const autocompleteResultsElement = $("#autocomplete-results");

    async function fetchAndDisplayCountries(searchTerm = "") {
        try {
            const response = await fetch("pays.json");
            const countries = await response.json();

            const filteredCountries = countries.filter(country =>
                country.nom_fr_fr.toLowerCase().includes(searchTerm.toLowerCase())
            );

            autocompleteResultsElement.empty();
            if (filteredCountries.length === 0 || searchTerm === "") {
                autocompleteResultsElement.hide();
            } else {
                filteredCountries.forEach(country => {
                    const countryItem = `
                        <li class="list-group-item" data-country="${country.alpha2}">
                            ${country.nom_fr_fr} - ${country.alpha2}
                        </li>
                    `;
                    autocompleteResultsElement.append(countryItem);
                });

                // Afficher la liste des résultats
                autocompleteResultsElement.show();

                // Ajouter un gestionnaire de clic sur chaque élément de la liste
                autocompleteResultsElement.find("li").on("click", function () {
                    const countryCode = $(this).data("country");
                    const countryText = $(this).text().trim();  // Utilise trim() pour enlever les espaces inutiles

                    $("#countrySearch").val(countryText); // Mettre le texte sélectionné dans le champ de recherche
                    autocompleteResultsElement.hide(); // Cacher la liste d'autocomplétion
                });
            }
        } catch (error) {
            console.error("Erreur lors du chargement des pays :", error);
            alert("Impossible de charger les données des pays.");
        }
    }

    // Gérer la saisie de l'utilisateur dans le champ de recherche
    $("#countrySearch").on("input", function () {
        const searchTerm = $(this).val().trim();  // Retirer les espaces
        fetchAndDisplayCountries(searchTerm);
    });

    // Gérer le clic sur le bouton de recherche
    $("#btnSearchCountry").on("click", function () {
        const searchTerm = $("#countrySearch").val().trim();

        if (searchTerm !== "") {
            // Vérifier si l'utilisateur a entré un code alpha-2 directement
            if (searchTerm.length === 2 && /^[a-zA-Z]{2}$/.test(searchTerm)) {
                // Recherche directe par code alpha-2
                fetchCountryDetails(searchTerm.toUpperCase());
            } else {
                // Recherche basée sur l'autocomplétion
                const countryCode = searchTerm.split(" - ")[1];
                if (countryCode) {
                    fetchCountryDetails(countryCode);
                } else {
                    alert("Aucun pays sélectionné. Veuillez d'abord sélectionner un pays.");
                }
            }
        } else {
            alert("Veuillez entrer un nom de pays ou un code alpha-2.");
        }
    });

    // Fonction pour récupérer et afficher les détails d'un pays
    async function fetchCountryDetails(countryCode) {
        try {
            const response = await fetch(`http://api.geonames.org/countryInfo?username=monstero&country=${countryCode}`);
            
            if (response.status === 200) {
                const data = await response.text();

                // Parser le XML renvoyé par l'API
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "application/xml");

                // Extraire les informations nécessaires
                const country = xmlDoc.getElementsByTagName("country")[0];
                const countryName = country.getElementsByTagName("countryName")[0].textContent;
                const population = country.getElementsByTagName("population")[0].textContent;
                const north = parseFloat(country.getElementsByTagName("north")[0].textContent);
                const south = parseFloat(country.getElementsByTagName("south")[0].textContent);
                const east = parseFloat(country.getElementsByTagName("east")[0].textContent);
                const west = parseFloat(country.getElementsByTagName("west")[0].textContent);
                const countryCodeFromAPI = country.getElementsByTagName("countryCode")[0]?.textContent || "Non disponible";

                // Ajouter le drapeau
                const flagImg = `<img src="flags/${countryCode}.png" alt="${countryName} flag" style="width: 60%; height: auto; margin-top: 20px;">`;

                // Vérifier les coordonnées pour définir la zone géographique
                const latitude = (north + south) / 2;
                const longitude = (east + west) / 2;

                // Construire les informations du pays à afficher
                const countryInfo = `
                    <p><strong>Nom :</strong> ${countryName}</p>
                    <p><strong>Population :</strong> ${population}</p>
                    <p><strong>Code du pays :</strong> ${countryCodeFromAPI}</p>
                    <p><strong>Flag:</strong> ${flagImg}</p>
                `;
                $("#countryInfo").html(countryInfo);

                // Mettre à jour la carte avec les coordonnées calculées
                resetMap(latitude, longitude, north, south, east, west);
            } else {
                throw new Error("Erreur lors de la récupération des données.");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des détails du pays :", error);
            alert(`Une erreur est survenue : ${error.message}`);
        }
    }

    // Fonction pour réinitialiser et initialiser la carte
    let map = null;

    function resetMap(latitude, longitude, north, south, east, west) {
        // Si la carte existe déjà, on la détruit pour réinitialiser
        if (map !== null) {
            map.remove(); // Détruire la carte existante
        }

        // Initialiser une nouvelle carte
        map = L.map("countryMap").setView([latitude, longitude], 6);

        // Ajouter les tuiles de la carte
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

        // Définir les limites de la carte
        map.fitBounds([[south, west], [north, east]]);
    }
});