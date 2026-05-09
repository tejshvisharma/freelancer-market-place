import axios from 'axios';

export async function resendVerificationEmail(resendUrl: string, email: string) {
    // POST with email in body
    return axios.post(resendUrl, { email });
}
