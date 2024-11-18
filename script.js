const SHEET_ID = '1kXbT9Ia6-rRGlDjGdwAtHShsw267eXxxLDk-wtn19f8';
const SHEET_NAME = 'Employees';
const API_KEY = 'AIzaSyAFnyXSAki4LiczKNhyEzbhHsvTC-abfAo';

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
    })
        .then(() => gapi.client.load('sheets', 'v4'))
        .then(() => console.log('API client initialized and Sheets API loaded.'))
        .catch(handleApiError);
}

function lookupEmail() {
    const employeeId = document.getElementById('employeeId').value.trim();
    const birthday = document.getElementById('birthday').value.trim();

    resetErrorMessages();
    validateInputs(employeeId, birthday);

    if (!employeeId || !birthday) return;

    const reformattedBirthday = formatBirthday(birthday);

    fetchEmployeeData(employeeId, reformattedBirthday)
        .then(email => displayResult(email))
        .catch(error => handleError(error));
}

function resetErrorMessages() {
    document.getElementById('result').innerText = '';
    document.getElementById('errorEmployee').innerText = '';
    document.getElementById('errorBirthday').innerText = '';
}

function validateInputs(employeeId, birthday) {
    if (!employeeId) {
        document.getElementById('errorEmployee').innerText = 'กรุณาใส่รหัสพนักงานให้ถูกต้อง';
    }

    if (!birthday) {
        document.getElementById('errorBirthday').innerText = 'กรุณาใส่วันเกิด';
    }
}

function formatBirthday(birthday) {
    const parts = birthday.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function fetchEmployeeData(employeeId, birthday) {
    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A:F`
    })
        .then(response => {
            const rows = response.result.values;
            if (!rows || rows.length === 0) {
                throw new Error('No data found');
            }

            const row = rows.find(row => row[0] === employeeId && row[4] === birthday);
            if (!row || !row[5]) {
                throw new Error('No email found for the given employee ID and birthday');
            }

            return row[5];
        });
}

function displayResult(email) {
    document.getElementById('result').innerText = `อีเมลของคุณคือ : ${email}`;
    document.getElementById('result').style.color = '';
}

function handleError(error) {
    document.getElementById('result').innerText = error.message || 'Error fetching data.';
    document.getElementById('result').style.color = 'red';
}

function handleApiError(error) {
    console.error('Error during API initialization:', error);
}

gapi.load('client', initClient);
