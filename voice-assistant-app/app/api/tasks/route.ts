import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";


const supabase=createClient(

process.env.NEXT_PUBLIC_SUPABASE_URL!,

process.env.SUPABASE_SERVICE_ROLE_KEY!

);




export async function GET(){


try{


const{
data:latestPlan,
error:planError

}=await supabase

.from("user_plans")

.select("id")

.order(
"created_at",
{
ascending:false
}
)

.limit(1)

.maybeSingle();





if(planError)
throw planError;






if(!latestPlan){


return NextResponse.json({

tasks:[]

});


}







const{

data:tasks,

error:taskError

}=await supabase

.from("planned_tasks")

.select("*")

.eq(
"plan_id",
latestPlan.id
)

.order(
"execution_time",
{
ascending:true
}
);





if(taskError)
throw taskError;







const priorityOrder:any={


CRITICAL:1,

HIGH:2,

MEDIUM:3,

LOW:4


};







const sortedTasks=
(tasks||[]).sort(

(a,b)=>

priorityOrder[a.priority]
-
priorityOrder[b.priority]

);






const total=
sortedTasks.length;



const completed=
sortedTasks.filter(

task=>

task.status==="COMPLETED"

).length;





const productivity=

total===0?

0:

Math.round(
(completed/total)*100
);







return NextResponse.json({

tasks:sortedTasks,

stats:{

total,

completed,

pending:
total-completed,

productivity

}

});





}

catch(error:any){


console.log(
"Task Fetch Error:",
error
);



return NextResponse.json(

{
error:error.message
},

{
status:500
}

);


}


}