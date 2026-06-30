import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";


const supabase=createClient(

process.env.NEXT_PUBLIC_SUPABASE_URL!,

process.env.SUPABASE_SERVICE_ROLE_KEY!

);




export async function POST(req:Request){


try{


const{
id
}=await req.json();





if(!id){


return NextResponse.json(

{
error:"Task id missing"
},

{
status:400
}

);


}







const{

data,

error

}=await supabase

.from("planned_tasks")

.update({

status:"COMPLETED"

})

.eq(
"id",
id
)

.select()

.single();







if(error)
throw error;






return NextResponse.json({

success:true,

task:data

});





}

catch(error:any){


console.log(
"Complete Task Error:",
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