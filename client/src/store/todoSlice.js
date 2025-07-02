import { createSlice } from "@reduxjs/toolkit";


const todoSlice = createSlice({
    name: 'todos',
    initialState: [], 
    reducers: {
        setTodos: (state, action) => {
            return action.payload; 
        },
        addTodos: (state, action) => {
            state.push(action.payload); 
        },
        deleteTodos: (state, action) => {
            return state.filter(task => task._id !== action.payload);
        },
        editTodos: (state, action) => {
            const updated = action.payload;
            return state.map((todo)=>(
                todo._id === updated._id ? updated:todo
            ))
        }
    },
});

export const { setTodos, addTodos, deleteTodos, editTodos } = todoSlice.actions;
export default todoSlice.reducer;
