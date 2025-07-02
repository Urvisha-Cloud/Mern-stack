import axios from "./axiosInstance";

export const getTaskApi =  async (id)=>{
    try{
      const response = await axios.get(`/task/get/${id}`);
      return response.data;
    }catch(err){
        throw err;
    }
}

export const addTaskApi = async (data)=>{
    try{
     const response = await axios.post("/task/add", data);
     return response.data;
    }catch(err){
        throw err;
    }
}

export const deleteTaskApi = async (id) =>{
    try{
      const response = await axios.delete(`/task/delete/${id}`);
      return response.data;
    }catch(err){
        throw err;
    }
}

export const editTaskApi = async (id, data) =>{
    try{
     const response = await axios.put(`/task/edit/${id}`, data);
     return response.data;
    }catch(err){
        throw err;
    }
}