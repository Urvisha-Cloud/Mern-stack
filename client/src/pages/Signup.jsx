import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { BiSolidHide, BiShow } from "react-icons/bi";
import { toast } from "react-toastify";
import { useForm, useFieldArray } from "react-hook-form";
import { registerUserApi } from "../api/userApi";

function Signup() {
  const [signPass, setIsSignPass] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPass: '',
      numbers: [{ value: '' }],
    },
  });

  const { fields, append } = useFieldArray({
    control,
    name: "numbers",
  });

  const watchPassword = watch("password");

  const onSubmit = async (data) => {
    try {
      const phoneNumbers = data.numbers.map((n) => n.value);
      const res = await registerUserApi({
        ...data,
        numbers:phoneNumbers
      });

        toast.success("User Added..!");
        navigate("/login", { state: { user: res.user } });
    
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Failed to register user. Try again.";
      toast.error(errMsg);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F2F9FF]">
      <form onSubmit={handleSubmit(onSubmit)} className="w-[500px] bg-white shadow-lg p-14">
        <h1 className="text-center text-blue-500 font-semibold text-3xl my-5">Register User</h1>

        <div>
          <input
            type="text"
            placeholder="Enter Your Firstname"
            {...register("firstName", { required: "First name is required" })}
            className="border px-3 py-2 rounded-md my-3 w-full outline-none border-[#D9EAFD]"
          />
          {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="Enter Your Lastname"
            {...register("lastName", { required: "Last name is required" })}
            className="border px-3 py-2 rounded-md my-3 w-full outline-none border-[#D9EAFD]"
          />
          {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
        </div>

        <div>
          <input
            type="email"
            placeholder="Enter Your Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email format",
              },
            })}
            className="border px-3 py-2 rounded-md my-3 w-full outline-none border-[#D9EAFD]"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div className="relative">
          <input
            type={signPass ? "text" : "password"}
            placeholder="Enter Your Password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            className="border px-3 py-2 rounded-md my-3 w-full outline-none border-[#D9EAFD]"
          />
          <button
            type="button"
            onClick={() => setIsSignPass(prev => !prev)}
            className={`absolute right-3 transform -translate-y-1/2 text-lg text-blue-500 ${errors.password ? "top-[37%]" : "top-1/2"}`}
          >
            {signPass ? <BiShow /> : <BiSolidHide />}
          </button>
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="Confirm Password"
            {...register("confirmPass", {
              required: "Confirm password is required",
              validate: value => value === watchPassword || "Passwords do not match",
            })}
            className="border px-3 py-2 rounded-md my-3 w-full outline-none border-[#D9EAFD]"
          />
          {errors.confirmPass && <p className="text-red-500 text-sm">{errors.confirmPass.message}</p>}
        </div>

        <div className="flex justify-between">
          <div className="w-full">
            {fields.map((field, index) => (
              <div key={field.id}>
                <input
                  type="number"
                  placeholder="Phone Number"
                  {...register(`numbers.${index}.value`, {
                    required: "Phone number is required",
                    pattern: {
                        
                      value: /^[0-9]{10}$/,
                      message: "Phone number must be 10 digits",
                    },
                  })}
                  className="border px-3 py-2 rounded-md my-3 outline-none border-[#D9EAFD] w-3/5"
                />
                {errors.numbers?.[index]?.value && (
                  <p className="text-red-500 text-sm">
                    {errors.numbers[index].value.message}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div>
            <button type="button" onClick={() => append({ value: '' })} className="border border-[#D9EAFD] px-4 py-2 rounded-md text-[15px] text-[#A6AEBF] mt-3">+</button>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <button type="submit" className="bg-blue-400 text-white font-semibold px-8 py-2">Add User</button>
          
        </div>
        <div className="flex justify-center mt-5">
            <a href="/Login" className="underline text-center text-blue-600">Login</a>
        </div>
      </form>
    </div>
  );
}

export default Signup;


