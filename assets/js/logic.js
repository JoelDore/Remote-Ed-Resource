$(document).ready(() => {
    const statesArray = ['AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'];
    const stateSelectElement = $("#state-select");
    const zipHistoryDatalist = $("#zip-history");
    const resultsDiv = $("#data-results")
    let zipHistoryArray;

    // Populate State Abbr. dropdown list
    statesArray.forEach((item) => {
        stateSelectElement.append(`<option>${item}</option>`);
    });
    // Get ZIP code history from local storage
    zipHistoryArray = JSON.parse(localStorage.getItem("zipHistory")) || [];
    updateHistory();

    // Search Button onclick event
    $("#search-button-state").click(() => {

        // Validate ZIP
        const zipInput = $("#search-zip").val();
        if (isNaN(zipInput) || zipInput.length !== 5) {
            resultsDiv.html("Please enter a valid 5-digit zip code")
            return
        }

        const stateSelect = $("#state-select option:selected").text();
        const queryURL =
            `https://educationdata.urban.org/api/v1/schools/ccd/directory/2018/?state_location=${stateSelect}`

        showSpinner()

        $.ajax({
            url: queryURL,
            method: "GET",
        }).then(({ results }) => {
            resultsDiv.html('')

            const schools = results.filter(school => school.zip_location === zipInput || school.zip_mailing === zipInput)

            if (schools.length === 0) {
                resultsDiv.html(`
                <div class='card m-3 bg-light'>
                    <div class='card-body'>
                        <h3>No results found</h3>
                        <p>Please enter a valid 5-digit zip code or try a new one</p>
                    </div>
                </div>
                `)
                return
            }
            schools.forEach(school => {
                const schoolName = school.school_name;
                const phoneNumber = school.phone;
                const enrollment = school.enrollment;
                const card = `
                <div class='card m-3 bg-light'>
                    <div class='card-body'>
                        <b>School Name:</b> ${schoolName} <br>
                        <b>Phone:</b> ${phoneNumber} <br> 
                        <b>Enrollment:</b> ${enrollment} students
                    </div>
                </div>
                `
                resultsDiv.append(card)
            })

            if (zipHistoryArray.includes(zipInput)) {
                let rptIndex = zipHistoryArray.indexOf(zipInput);
                zipHistoryArray.splice(rptIndex, 1);
            };
            zipHistoryArray.unshift(zipInput);
            updateHistory();
        })
    })

    function showSpinner() {
        const spinner = `
            <div id="data-results" class="text-center">
                <div class="spinner-border m-5" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
            `
        resultsDiv.html(spinner)
    }

    function updateHistory() {
        localStorage.setItem("zipHistory", JSON.stringify(zipHistoryArray));

        zipHistoryDatalist.html('')
        for (let i = 0; i < zipHistoryArray.length; i++) {
            let newOption = `<option value="${zipHistoryArray[i]}"/>`;
            zipHistoryDatalist.append(newOption);
        }
        $("#search-zip").val('')
    }
})