"use client";

import {Calendar,dateFnsLocalizer} from "react-big-calendar";
import {
format,
parse,
startOfWeek,
getDay
} from "date-fns";

import {enUS} from "date-fns/locale";

import "react-big-calendar/lib/css/react-big-calendar.css";


interface Task{

id:string;

task_title:string;

execution_time:string;

priority:string;

status:string;

}


interface CalendarViewProps{

tasks:Task[];

}


const locales={
"en-US":enUS
};



const localizer=dateFnsLocalizer({

format,

parse,

startOfWeek,

getDay,

locales

});



export default function CalendarView(
{
tasks
}:CalendarViewProps
){


const events=tasks.map(
(task)=>({

id:task.id,

title:task.task_title,

start:new Date(
task.execution_time
),

end:new Date(
new Date(task.execution_time)
.getTime()+30*60*1000
),

priority:task.priority

})
);




return(

<div className="bg-white rounded-2xl shadow p-6">


<h2 className="text-2xl font-bold mb-5">

📅 AI Smart Calendar

</h2>



<div style={{height:"700px"}}>


<Calendar

localizer={localizer}

events={events}

startAccessor="start"

endAccessor="end"

views={[
"month",
"week",
"day"
]}

defaultView="month"

popup

/>

</div>


</div>

);

}