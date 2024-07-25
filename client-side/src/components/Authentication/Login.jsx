import React,{useState,useRef,useEffect} from 'react'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Toaster from '../Toaster'
import '../../assets/style/myStyles.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { Backdrop ,CircularProgress} from '@mui/material';




const Login = () => {
    const[show,setShow]=useState(false)
    const[showPassword,setShowPassword]=useState(false)
    const [img, setImg]=useState()
    const [data,setData]=useState({name:"",email:"",password:"",image:""})
    const[loading , setLoading]= useState(false)
    const [toasterMessage, setToasterMessage]= useState("")
    const [severityVal, setSeverityVal]= useState("")
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [isSignUp,setIsSignUp] = useState(true)

    const navigate=useNavigate()
    const fileInputRef= useRef(null)

    const handleClick=()=>setShow(!show);
    const handleClickPassword=()=>setShowPassword(!showPassword);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
        setToasterMessage("");
        setSeverityVal("");
      };
    
      useEffect(() => {
        if (toasterMessage) {
          setSnackbarOpen(true);
        }
      }, [toasterMessage]);

    const postImage=(pic)=>{
        if(pic===undefined){
            console.log("Please select an image")
            return;
        }
        if(pic.type==="image/jpeg" || pic.type==="image/png"){
            const data= new FormData();
            data.append("file",pic)
            data.append("upload_preset", "chat-app")
            data.append("cloud_name","dpuc22zhd")
            fetch("https://api.cloudinary.com/v1_1/dpuc22zhd/image/upload",{
                method:"post",
                body:data
            })
            .then((res)=>res.json())
            .then((data)=>{
                console.log(data,"dataaaaaa")
                setImg(data.url.toString());
                setData((prevData) => ({ ...prevData, image: data.url.toString() }));
            }).catch((err)=>{
                console.log(err,"errorimgupload")
            })
        }
    }
    const changeHandler=(e)=>{
        setData({...data,[e.target.name]:e.target.value})
    }
    const handleFileInputClick = () => {
      fileInputRef.current.click();
      };

    const loginHandler=async(e)=>{
        e.preventDefault()
        if(!data.name||  ! data.password ){
            setToasterMessage("Please fill all fields!")
            setSeverityVal("error")
            return;
        }
        setLoading(true)
        try{
            const config={
                headers:{
                    "Content-type":"application/json"
                }
            }
            const response=await axios.post(
                "/user/login/",
                data,
                config
            )
            console.log("login : ",response)
            setToasterMessage("Login Successful!")
            setSeverityVal("success")
            setLoading(false);
            setTimeout(() => {
                localStorage.setItem("userData", JSON.stringify(response));
                navigate("/app/chat");
            }, 2000); 
        }
        catch(error){
            setToasterMessage("Invalid user name or password!")
            setSeverityVal("error")
           
        }
        setLoading(false)
    }

    const signUpHandler= async(e)=>{

        e.preventDefault();
        if(!data.name|| !data.email|| ! data.password || !data.image){
            setToasterMessage("Please fill all fields!")
            setSeverityVal("error")
            return;
        }
        
        setLoading(true);
        try{
            const config={
                headers:{
                    "Content-type":"application/json"
                }
            }
            const response= await axios.post(
                "/user/register",
                data,
                config
            );
            console.log("register response : ",response);
            setToasterMessage("Signup Successful!")
            setSeverityVal("success")
            setIsSignUp(true)
            localStorage.setItem("userData",JSON.stringify(response))
            console.log("sccesss")

        }

        catch(error){
            if (error.response && error.response.status === 405) {
                setToasterMessage("User with this email ID already exists!")
                setSeverityVal("error")
            }
        }
        setLoading(false)
       
    }

 
  return (
    <>


    <Backdrop
  sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
  open={loading}
>
  <CircularProgress color="secondary" />
</Backdrop>
<div className="position-absolute" style={{ top: "1rem", right: "2rem" }}>
        <Toaster message={toasterMessage} severity={severityVal} open={snackbarOpen} handleClose={handleSnackbarClose} />
      </div>
<div className="login_container">

<div className="main">

    <input type="checkbox" id="chk" aria-hidden="true" checked={isSignUp} onChange={() => setIsSignUp(!isSignUp)} />
    <div className="signup">
        <form>
            <label  className ='login_label' for="chk" aria-hidden="true">Sign up</label>
            <input  className ='login_input'type="text" name="name" placeholder="User name" onChange={changeHandler} required="" />
            <input  className ='login_input'type="email" name="email" placeholder="Email" onChange={changeHandler} required="" />
            <div className='password_input'>
            <input className ='login_input' type={show?"text":"password"}name="password" placeholder="Password" required="" onChange={changeHandler} />
            <span className='password_toggle'onClick={handleClick}>{show?<VisibilityIcon/>:<VisibilityOffIcon/>}</span>
            </div>
            <div className="file-input-container">
        <span className='labelInput'onClick={handleFileInputClick} >Choose File</span>
        <input className="login_input" type="file"  ref={fileInputRef} onChange={(e)=>postImage(e.target.files[0])} />
    </div>
            <button className='button_login' onClick={signUpHandler}>Sign up</button>  
        </form>
 
    </div>
    <div className="login">
        <form>
            <label className ='login_label' for="chk" aria-hidden="true">Login</label>
            <input className ='login_input' type="text" name="name" onChange={changeHandler} placeholder="Username" required=""  value={data.name} />
            <div className='password_input'>
            <input className ='login_input' type={showPassword?'text':"password"} name="password" onChange={changeHandler} placeholder="Password" required="" value={data.password} />
            <span className='password_toggle' onClick={handleClickPassword}>{showPassword?<VisibilityIcon/>:<VisibilityOffIcon/>}</span>
            </div>
            <button className='button_login' onClick={(e)=>{
                e.preventDefault()
                setData({...data,name:"guest",password:"Password"})
                }}>Get Guest Credentials</button>
            <button className='button_login' onClick={loginHandler}>Login</button>

        </form>
    </div>
</div>

</div>

   </>
  )
   
  
}

export default Login


