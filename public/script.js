// NOTCHUP API END POINT FOR AVAILABLE COURSE AND THEIR TIME SLOTS
let slotsEndPoint = 'https://script.google.com/macros/s/AKfycbzJ8Nn2ytbGO8QOkGU1kfU9q50RjDHje4Ysphyesyh-osS76wep/exec';
// VARIABLE TO STORE RESPONSE OF GET REQUEST MADE TO END POINT
let availableSlots;
// VARIABLE TO STORE DATE AND TIME OF TRIAL CLASSES OF AVAILABLE COURSE
let dateTimeOfClasses;

/**
 * FUNCTION TO MAKE GET REQUEST AND STORE RESPONSE TO NOTCHUP ENDPOINT
 * @param {string} url string for notchup classes slots
 * 1. MAKE A ASYNC GET REQUEST TO NOTCHUP API END POINT
 * 2. STORE AND PROCESS RESPONSE
 * 3. ADD AVAILABLE COURSES TO DOCUMENT
 * 4. CALL FUNCTION TO ADD DATE AND TIME OF AVAILABLE COURSES
 */
function get_available_slots(url)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){

            availableSlots = JSON.parse(xmlHttp.responseText);

            let courseElement = document.querySelector('#courses');
            //iterate over response and add course name to course element as a selectable option
            for (let course = 0; course < availableSlots.length; course++) {
                let option = document.createElement("option");
                option.text = availableSlots[course].course_name;
                courseElement.add(option);
            }

            //call function to add date and time of pre-selected course
            get_class_slots(document.querySelector('#courses').value);
        }
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}

//make initial get request when document is ready
get_available_slots(slotsEndPoint);


/**
 * FUNCTION TO PARSE ALL SLOTS AND TO STORE DATE-TIME OF AVAILABLE SLOTS
 * @param {string} selected_course selected course option string 
 * 1. ITERATE OVER AVAILABLE COURSES TO MATCH SELECTED COURSE
 * 2. IF FOUND THEN CREATE A OBJECT OF CORRECT DATE AND TIME OF SELECTED COURSE
 * 3. WE DISCARD ANY SLOT WHICH IS LESS THAN 4 HOUR OR MORE THAN 7 DAYS FROM NOW
 * 4. CALL FUNCTION TO ADD DATE AND TIME TO HTML DOC
 */
function get_class_slots(selected_course){
    for (let course = 0; course < availableSlots.length; course++) {
        //NOTE: WE CAN INCREASE ACCURACY BY UPDATING "availableSlots" EVERY TIME A COURSE IS SELECTED
        
        if (selected_course == availableSlots[course].course_name){
            //initialize date-time object to store selected course data
            dateTimeOfClasses = {};

            //variable to store current time and temp variable to store given time-slot
            let currentDateTime = new Date(), time_slot;
            //make a intercept date to discard any slot less than 4 hour from now
            let fourHourIntercept = new Date(currentDateTime.getTime() + (4 * 60 * 60 * 1000));
            //make a intercept date to discard any slot more than 7 days from now
            let sevenDaysIntercept = new Date(currentDateTime.getTime() + (6 * 24 * 60 * 60 * 1000));

            //iterate over selected course slots
            for (let slot_id = 0; slot_id < availableSlots[course].slots.length; slot_id++) {
                //<<<NOTE>>>> SLOTS COMING FROM NOTCHUP ENDPOINT GIVING "ONLY" PAST DATES (4 OCT)
                //TO OVERCOME THAT WE CAN BUMP SLOTS TO "x" DAYS AHEAD
                time_slot = new Date(Number(availableSlots[course].slots[slot_id].slot) + (15 * 24 * 60 * 60 * 1000));
                
                if(fourHourIntercept.getTime() > time_slot.getTime()){
                    continue;//discard slot if condition matches
                }
                if(sevenDaysIntercept.getTime() < time_slot.getTime()){
                    continue;//discard slot if condition matches
                }
    
                //first format date as day-month-year AND time as hour:minute AM/PM
                //if this date exist in the object then add another time slot to same the date 
                if(get_formatted_date(time_slot) in dateTimeOfClasses){
                    dateTimeOfClasses[get_formatted_date(time_slot)].push(get_formatted_time(time_slot));
                }else{
                    //else add the date as new key and then add time slot to that key
                    dateTimeOfClasses[get_formatted_date(time_slot)] = [];
                    dateTimeOfClasses[get_formatted_date(time_slot)].push(get_formatted_time(time_slot));
                }
            }
            
            //call function to add dates and time to html doc
            show_available_class_dates(Object.keys(dateTimeOfClasses));
        }
    }
}


/**
 * FUNCTION TO ADD DATE OPTION TO HTML DOCUMENT
 * @param {ARRAY} set_of_dates of unique available dates for trial classes
 * 1. ITERATE OVER UNIQUE AVAILABLE DATES FOR TRIAL CLASSES
 * 2. ADD EACH DATE AS SELECTABLE OPTION IN HTML Doctor
 * 3. CALL FUNCTION TO ADD TIME SLOT FOR SELECTED DATE  
 */
function show_available_class_dates(set_of_dates){
    let date_option;
    document.querySelector('#date').innerHTML = "";
    
    //iterate over available dates
    for (item of set_of_dates){
        date_option = document.createElement("option");
        date_option.text = item;
        //add each date as option
        document.querySelector('#date').add(date_option);
    }

    //add available time slots for selected date
    show_available_class_time(document.querySelector('#date').value);
}


/**
 * FUNCTION TO ADD AVAILABLE TIME SLOTS FOR A PARTICULAR DATE
 * @param {string} selectedDate selected date string 
 * 1. GET ARRAY OF TIME SLOT FOR SELECTED DATE
 * 2. ITERATE OVER TIME SLOTS AND ADD THEM TO HTML DOC
 */
function show_available_class_time(selectedDate){
    let time_option, timeArray;
    //get time slots array for selected date
    timeArray = dateTimeOfClasses[selectedDate];

    document.querySelector('#time').innerHTML = "";
    for (item of timeArray){
        time_option = document.createElement("option");
        time_option.text = item;
        //add time slots to html doc
        document.querySelector('#time').add(time_option);
    }
}

/**
 * FUNCTION TO FORMAT DATE AS "day-month-year"
 * @param {object} time_obj date object
 */
function get_formatted_date(time_obj){
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let year = time_obj.getFullYear();
    let month = months[time_obj.getMonth()];
    let day = time_obj.getDate();
    let date = day + ' - ' + month + ' - ' + year;
    return date;
}

/**
 * FUNCTION TO FORMAT TIME AS "hour:minute AM/PM"
 * @param {object} time_obj date object
 */
function get_formatted_time(time_obj){
    let hour = time_obj.getHours();
    let min = time_obj.getMinutes();
    //if minute value is '0' then update it to '00'
    min = min.toString().substring(0, 1) == '0' ? '00' : min.toString();
    //get AM or PM
    let amPm = hour < 12 ? "AM" : "PM";
    
    return ((hour % 12) || 12) + ':' + min + ' ' + amPm;
}

/**
 * FUNCTION TO SEND A ASYNC MAIL REQUEST TO SERVER
 * WITH ALL THE PARAMETER TAKEN FROM USER FORM
 * 1. GET ALL VALUES OF FORM
 * 2. CONFIGURE MAIL REQUEST URL
 * 3. MAKE AN ASYNC REQUEST AND SHOW/PRINT RESPONSE 
 */
function send_confirmation_mail(){
    //get form data
    let parentEmail = document.querySelector('#parentEmail').value;
    let parentName = document.querySelector('#parentName').value;
    let studentName = document.querySelector('#studentName').value;
    let date = document.querySelector('#date').value;
    let time = document.querySelector('#time').value;
    //configure mail request url
    let url = ''+ parentName +
    '&studentName=' + studentName + '&classTime=' + date + ' ' + time + 
    '&parentEmail='+ parentEmail;
    //request
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            //success acknowledgement
            //document.querySelector('#acknowledgment').innerHTML = 'Your Trial Class is successfully booked';
            let body = document.querySelector('#body');
            let tempBody = body.innerHTML;
            body.innerHTML = "<p id='acknowledgment'>Your NotchUp Trial Class is successfully booked</p>";
            sleep(6000).then(() => {
                body.innerHTML = tempBody;
            })
        }
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}

/**
 * delay execution of statement for some milliseconds
 * @param {number} milliseconds 
 */
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
