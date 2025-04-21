import axios from 'axios';
type LoginRequest = {
    id: string,
    password: string;
};
export async function loginUser(login: LoginRequest) {
    const response = await axios.post('http://localhost:8080/auth/login', login);
    return response.data;

}