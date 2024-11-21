// eslint-disable-next-line no-unused-vars
export default async function decorate(fieldDiv, field, htmlForm) {
    let input = fieldDiv?.querySelector('input');
    input.addEventListener('keyup', (event) => {
        if(input.value){
            let dob = new Date(input.value);
            let age = getAge(dob);
            let year = dob.getFullYear();
            let yearInString = year.toString();
            console.log(age);
            yearInString = yearInString.replace(/^0+/, '');
            if((age < 0 || (age > 120 && yearInString.length === 4) || !(yearInString.startsWith('1') || yearInString.startsWith('2') || yearInString.startsWith('0')))){
                debugger;
                input.setAttribute('edit-value','Date of Birth');
                input.setAttribute('display-value', 'Date of Birth');
                input.value = 'Date of Birth';
                const event1 = new Event('change', {
                    bubbles: true, // Allow the event to bubble up
                    cancelable: true, // Allow the event to be canceled
                });
                input?.dispatchEvent(event1);
            }
        }
    });

    return fieldDiv;

}

function getAge(d1, d2){
    d2 = d2 || new Date();
    var diff = d2.getTime() - d1.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}