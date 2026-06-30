"use client";

import {
BarChart3,
CheckCircle,
Clock
}from"lucide-react";


interface Task{
id:string;
status:string;
priority:string;
}


interface DashboardProps{
tasks:Task[];
}


export default function Dashboard({tasks}:DashboardProps){


const total=tasks.length;


const completed=
tasks.filter(
task=>task.status==="COMPLETED"
).length;


const pending=total-completed;


const score=
total===0?
0:
Math.round(
(completed/total)*100
);



return(

<section className="grid md:grid-cols-3 gap-4">


<div className="bg-white p-5 rounded-2xl shadow">

<div className="flex gap-2 text-indigo-600">
<BarChart3/>
<h3>Productivity</h3>
</div>

<p className="text-4xl font-bold">
{score}%
</p>

</div>



<div className="bg-white p-5 rounded-2xl shadow">

<div className="flex gap-2 text-green-600">
<CheckCircle/>
<h3>Completed</h3>
</div>

<p className="text-4xl font-bold">
{completed}
</p>

</div>




<div className="bg-white p-5 rounded-2xl shadow">

<div className="flex gap-2 text-orange-600">
<Clock/>
<h3>Pending</h3>
</div>

<p className="text-4xl font-bold">
{pending}
</p>

</div>


</section>

);

}