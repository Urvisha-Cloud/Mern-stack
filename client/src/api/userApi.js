import axios from './axiosInstance';

export const loginUserApi = async (data)=>{
    try{
        const response = await axios.post('user/login',{
        loginEmail:data.email,
        loginPassword:data.password
    });
    return response.data;
    }catch(err){
        throw err;
    }
}

export const registerUserApi = async (data)=>{
    try{
        const response = await axios.post('/user/register', data);
        return response.data;
    }
    catch(err){
        throw err;
    }
}

export const logoutUserApi = async (data) =>{
    const response = await axios.get('/user/logout',data);
    return response.data;
}