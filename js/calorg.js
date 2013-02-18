
// CONFIGURATION
CRYPTED = "CRYPTED";
EVENTS_PHP = 'events.php';
TASKS_PHP = 'tasks.php';

// Global variables

eventss = new Array();
taskss = new Array();
password = "";
secret = "";


//
// EVENTS MANAGEMENT
//

function events_load(){
	// 
	// Load events from server, add them to eventss array, reload calendar events
	//

	$.get(EVENTS_PHP, function(data) {

		// For each event
		for (var i = 0; i < data.length; i++) {

			// Decrypt title or set it with CRYPTED
			var title = CRYPTED;
			if (password)
				title = sjcl.decrypt(password, $.base64.decode(data[i]['title']));

			// allDay boolean is false by default
			var allDay = false;
			if (data[i]['allDay'] == "true")
				allDay = true;
		
			// Add event to eventss
			eventss.push({
				title:  title,
				id: data[i]['id'],
				start: data[i]['start'],
				end: data[i]['end'],
				allDay: allDay,
			});

		}

		// Load events in calendar
		calendar.fullCalendar( 'refetchEvents' );

	});

}

function event_add(dict){
	//
	// Send new event to server
	//
	
	if (dict.title) {
		var e =	{
			title: dict.title,
			start: dict.start,
			end: dict.end,
			allDay: dict.allDay
		};

		event_send(e);

		calendar.fullCalendar('renderEvent', e, true);
	}

	calendar.fullCalendar('unselect');
}

function event_update(dict){
	//
	// Update event to server
	//

	if (dict.title) {
		dict.e.title = dict.title;
		dict.e.start = dict.start;
		dict.e.end = dict.end;
		dict.e.allDay = dict.allDay;

		$('#calendar').fullCalendar('updateEvent', dict.e);
		event_send(dict.e);
	} else {
		event_remove(dict.e);
	}

	calendar.fullCalendar('unselect');
}


function event_send(event){
	//
	// Send event to server
	//

	// Encrypt title
	if (event.title){
		title = $.base64.encode( sjcl.encrypt(password, event.title,{count:2048,ks:256}) );
	} else {
		title = "";
	}

	var start = $.fullCalendar.formatDate(event.start, "u");
	var end = $.fullCalendar.formatDate( event.end, "u");

	$.post(EVENTS_PHP, { 

		id: event.id, 
		title: title, 
		start: start, 
		end: end, 
		allDay: event.allDay, 
		hash: get_hash(title) },

		function(data) {
			// Server should return event id
			if (!is_int(data)) {
				alert("ERROR : "+data);
			} else {
				event.id = parseInt(data);
			}
		});
}

function event_remove(event){
	//
	// Remove event on server
	//
	
	hide_prompt({call : function(){}});
	event.title = "";
	event_send(event);
	calendar.fullCalendar('removeEvents', event._id );
}


//
// TASK MANAGEMENT
//

function task_send(task){
	//
	// Send task to server 
	//
	
	// Encrypt title
	if (task.title)
		title = $.base64.encode( sjcl.encrypt(password, task.title,{count:2048,ks:256}) );
	else
		title = "";
	
	$.post("tasks.php", { title: title, id: task.id, hash: get_hash(title) },

		function(data) {
			// Server should return event id
			if (!is_int(data)) {
				console.log(data);
				alert("ERROR : "+data);
			} else {
				task.id = parseInt(data);
				tasks_load();
			}
		});
}

function task_remove(task){
	//
	// Remove task on server
	//
	
	hide_prompt({call : function(){}});
	task.title = "";
	task_send(task);
}

function tasks_load(){
	//
	// Load tasks from server, push them in taskss array, and display them
	//
	
	var todo = document.getElementById("todo");
	var res = "";

	$.get(TASKS_PHP, function(data) {

		for (var i = 0; i < data.length; i++) {

			// Decrypt title 
			var title = CRYPTED;
			if (password) 
				title = sjcl.decrypt(password, $.base64.decode(data[i]['title']));
			
			var new_task = { 
				title :  title,
				id : data[i]['id'],
			};

			// Index of new task is taskss.length - 1
			tab_id = taskss.push(new_task)-1;

			// Display
			res += "<div id='task_"+data[i]['id']+"' onclick='display_prompt({title: \""+new_task.title+"\", id : "+new_task.id+", call : task_update, t : {id : {title: \""+new_task.title+"\", id : "+new_task.id+"}}' ("+new_task.id+", \""+new_task.title+"\");' class='external-event'>"+title+"</div>";
		}

		// Really display and enable dropable behaviour
		todo.innerHTML = res;
		tasks_init();

	});

}


function task_add(dict){
	//
	// Send new task to server
	//

	if (dict.title)
		task_send({'title': dict.title});

}


function task_update(task_id, task_title){
	//
	// Update task on server
	//
	
	//var task = {
	//	title: task_title,
	//	id: task_id,
	//};
	//var title = task.title;
	//task.title = prompt('Task :', title);
	//task_send(task);

}

function tasks_init(){
	//
	// Init tasks with dropable behaviour
	//

	// For each task
	$('#external-events div.external-event').each(function() {

		// create an Event Object
		var eventObject = {
			title: $.trim($(this).text()), 
			id: parseInt($(this).attr("id").slice(5)), // ID = task_ID without task_ 
		};

		// store the Event Object in the DOM element so we can get to it later
		$(this).data('eventObject', eventObject);

		// make the event draggable using jQuery UI
		$(this).draggable({
			zIndex: 9999,
			revert: true,      // will cause the event to go back to its
			revertDuration: 0  //  original position after the drag
		});

	});
}


//
// PROMPT
//

function display_prompt(dict){

	// TITLE
	document.getElementById("prompt_title").innerHTML = dict.title;
	document.getElementById("prompt_title_input").value = dict.title_input;

	// START
	if ("start" in dict) {
		$('#prompt_start').datetimepicker('setDate', dict.start );
		document.getElementById('prompt_start').style.visibility = "visible";
		document.getElementById("prompt_button_delete").onclick = function(){event_remove(dict.e)};
	} else {
		document.getElementById("prompt_button_delete").onclick = function(){task_remove(dict.id)};
		document.getElementById('prompt_start').style.visibility = "hidden";
	}

	// END
	if ("end" in dict) {
		$('#prompt_stop').datetimepicker('setDate', dict.end );
		document.getElementById('prompt_stop').style.visibility = "visible";
	} else {
		document.getElementById('prompt_stop').style.visibility = "hidden";
	}
	
	// ALLDAY
	if ("allDay" in dict) {
		document.getElementById("prompt_allday").checked = dict.allDay;
		document.getElementById('prompt_allday').style.visibility = "visible";
	} else {
		document.getElementById('prompt_allday').style.visibility = "hidden";
	}
	
	document.getElementById("prompt_button").onclick = function(){hide_prompt(dict)};
	//document.getElementById("prompt_button").onClick = 'alert("pouet");';
	document.getElementById("prompt_button").innerHTML = dict.button;

	//Show
	document.getElementById("prompt").style.marginTop = "0px";

}

function hide_prompt(dict){
	//
	// Hide prompt and parse values
	//
	
	document.getElementById("prompt").style.marginTop = "-150px";

	var title = document.getElementById("prompt_title_input").value;

	if (document.getElementById("prompt_start").style.visibility == "visible")
		var start = $('#prompt_start').datetimepicker('getDate');
	else 
		var start = "";

	if (document.getElementById("prompt_stop").style.visibility == "visible")
		var end = $('#prompt_stop').datetimepicker('getDate');
	else 
		var end = "";

	if (document.getElementById("prompt_allday").style.visibility == "visible")
		var allday = document.getElementById("prompt_allday").checked;
	else 
		var allday = "";


	dict.title = title;
	dict.start = start;
	dict.end = end;
	dict.allDay =  allday;

	dict.call(dict);
}


//
// TOOLS
//

function is_int(value){ 
	if((parseFloat(value) == parseInt(value)) && !isNaN(value)){
		return true;
	} else { 
		return false;
	} 
}

function get_hash(str){
	var msg = str+secret;
	return $.base64.encode($.sha256(msg));	
}

//
// CALENDAR
//

function calendar_init() {

	calendar = $('#calendar').fullCalendar({

		header: {
			left: '',
			center: '',
			right: '',
		},

		
		drop: function(date, allDay) { // this function is called when something is dropped

			// retrieve the dropped element's stored Event Object
			var originalEventObject = $(this).data('eventObject');

			// we need to copy it, so that multiple events don't have a reference to the same object
			var copiedEventObject = $.extend({}, originalEventObject);

			// assign it the date that was reported
			copiedEventObject.start = date;
			copiedEventObject.allDay = allDay;

			// taskid and eventid are different
			delete  copiedEventObject.id; 

			// render the event on the calendar
			// the last `true` argument determines if the event "sticks" (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)

			event_send(copiedEventObject);
			$('#calendar').fullCalendar('renderEvent', copiedEventObject, true);

			// is the "remove after drop" checkbox checked?
			if ($('#drop-remove').is(':checked')) {
				// if so, remove the element from the "Draggable Events" list
				$(this).remove();
				task_remove(originalEventObject);
			}

		},

		editable: true,
		droppable: true, // this allows things to be dropped onto the calendar !!!
		selectable: true,
		selectHelper: true,
		events: eventss, // set events source with our array
		firstDay: 1, // first day is monday
		defaultView: "agendaWeek",
		axisFormat: 'H(:mm)',
		firstHour: 8,
		minTime: 7,
		slotMinutes: 30,
		allDayText: "",
		aspectRatio: 0.5,

		timeFormat: {
			// for agendaWeek and agendaDay
			agenda: 'H:mm{ - H:mm}', 
			// for all other views
			'': 'H(:mm)'            
		},

		columnFormat: {
			month: 'ddd',    
			week: 'ddd dd/MM', 
			day: 'dddd dd/MM'  
		},

		titleFormat: {
			month: 'MMMM yyyy',                             // September 2009
			week: "dd MMM [ yyyy]{ '&#8212;' dd MMM yyyy}", // Sep 7 - 13 2009
			day: 'dddd dd MMM yyyy'                  // Tuesday, Sep 8, 2009
		},

		buttonText: {
			prev:     '&nbsp;&#9668;&nbsp;',  // left triangle
			next:     '&nbsp;&#9658;&nbsp;',  // right triangle
			prevYear: '&nbsp;&lt;&lt;&nbsp;', // <<
			nextYear: '&nbsp;&gt;&gt;&nbsp;', // >>
			today:    'Aujourd\'hui',
			month:    'Mois',
			week:     'Semaine',
			day:      'Journee'
		},

		// French part
		monthNames: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'],
		monthNamesShort: ['Jan','Fev','Mar','Avr','Mai','Jui','Jul','Aou','Sep','Oct','Nov','Dec'],
		dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','vendredi','Samedi'],
		dayNamesShort: ['Dim','Lun','Mar','Mec','Jeu','Ven','Sam'],

		select: function(start, end, allDay) {

			display_prompt({title: "Event title : ", title_input: "", button: "Save", call: event_add, start : start, end : end, allDay: allDay});

		},

		eventDrop: function(event, delta) {
			event_send(event);
		},

		eventClick: function(calEvent, jsEvent, view) {
			display_prompt({title: "Event title : ", title_input: calEvent.title, button: "Save", call: event_update, start : calEvent.start, end : calEvent.end, allDay : calEvent.allDay, e : calEvent});
			//var title = window.prompt("Evenement :",calEvent.title);
					},

		loading: function(bool) {
			if (bool) $('#loading').show();
			else $('#loading').hide();
		},

		eventResize: function( event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view ) { 
			event_send(event);
		},

	});
}

