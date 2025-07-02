import { useState, useEffect } from 'react';
import { loginUserApi } from '../api/userApi';
import { useNavigate } from 'react-router-dom';
import { BiSolidHide, BiShow, BiLock } from "react-icons/bi";
import { MdOutlineMail } from "react-icons/md";
import { toast } from "react-toastify";
import { useForm } from 'react-hook-form';

const Login = () => {
  const [loginPass, setIsLoginPass] = useState(false);
  const navigate = useNavigate();
  const [errs, setErr] = useState({ email: null, password: null, message: null });

  useEffect(() => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const user = localStorage.getItem("user")
  if (isLoggedIn === "true" && user) {
    navigate("/home", { replace: true });
  }
}, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    clearErrors
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");

  const handleChange = async (fieldName) => {
    await trigger(fieldName);
    clearErrors(fieldName);
    setErr({ ...errs, [fieldName]: null, message: null });
  };

  const loginUser = async (data) => {
    try {
      const res = await loginUserApi(data);

      if (res.user && res.token) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(res.user));
        toast.success("Login successful!");
        localStorage.setItem("token",res.token);
        navigate("/home", {replace: true});
      }
    } catch (err) {
      const errorRes = err?.response?.data;

      setErr({
        email: errorRes?.email || null,
        password: errorRes?.password || null,
        message: errorRes?.message || null
      });
     const ToastError = errorRes?.email || errorRes?.password || errorRes?.message ;
     if(ToastError){
      toast.error(ToastError);
     }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F2F9FF]">
      <form onSubmit={handleSubmit(loginUser)} className="w-[500px] bg-white shadow-lg p-14">
        <h1 className="text-center text-blue-500 font-semibold text-3xl my-5">Login User</h1>
        <div className='relative'>
          <input
            type="text"
            value={emailValue}
            onChange={() => handleChange('email')}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
            className={`p-2 w-full rounded-md border border-[#D9EAFD] placeholder:opacity-0 outline-none my-2`}
            placeholder="Enter Email"
          />
          <span className={`absolute left-3 ${errors.email ? "top-[37%]" : "top-1/2"} transform -translate-y-1/2 text-gray-400 pointer-events-none flex items-center gap-1 transition-all ${emailValue ? 'hidden' : 'block'}`}>
            <MdOutlineMail size={14} />
            <span>Enter Your Email</span>
          </span>
          {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>}
        </div>
        <div className="relative">
          <input
            type={loginPass ? "text" : "password"}
            onChange={() => handleChange('password')}
            value={passwordValue}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            })}
            className={`p-2 w-full rounded-md border border-[#D9EAFD] placeholder:opacity-0 outline-none my-2`}
            placeholder="Enter Password"
          />
          <span className={`absolute left-3 transform -translate-y-1/2 text-gray-400 pointer-events-none flex items-center gap-1 transition-all ${errors.password ? "top-[37%]" : "top-1/2"} ${passwordValue ? 'hidden' : 'block'}`}>
            <BiLock size={15} />
            <span>Enter Your Password</span>
          </span>
          <button
            type="button"
            onClick={() => setIsLoginPass(prev => !prev)}
            className={`absolute right-3 transform -translate-y-1/2 text-lg text-blue-500 ${errors.password ? "top-[37%]" : "top-1/2"}`}
          >
            {loginPass ? <BiShow /> : <BiSolidHide />}
          </button>
          {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
        </div>

        {errs.message && (
          <p className="text-center text-red-500 mb-4">{errs.message}</p>
        )}

        <div className="flex justify-center mt-10 hover:scale-105 transition-all duration-300">
          <button
            type="submit"
            className="bg-blue-400 text-white font-semibold px-8 py-2 hover:bg-blue-500"
          >
            Login
          </button>
        </div>
        <div className="flex justify-center mt-5">
          <a href="/signup" className="underline text-center text-blue-600">Signup</a>
        </div>
      </form>
    </div>
  );
};

export default Login;

