import React, { useRef, useState } from 'react';
import { Form, Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from "../context/AuthContext";
import { Link, useHistory } from "react-router-dom";
import Navbar from "./Navbar";

export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const auth = useAuth();
    const [error, setError] = useState();
    const [isLoading, setLoading] = useState(false);
    const [isValidEmail, setValidEmail] = useState(true);
    const history = useHistory();

    async function handleSubmit(e) {
        e.preventDefault();
        // Validation check
        try {
            setLoading(true);
            const user = await auth.login({email: emailRef.current.value, password: passwordRef.current.value});
            if(!(user.emailVerified)) {
                setLoading(false);
                setValidEmail(false);
                return
            }

            history.push("/");
            console.log("Login Successfull!");

        } catch (error) {
            setError(error.message);
        }
        
        setLoading(false);
    }

    return (
        <>
        <Card>
            <Card.Body>
                <h2 className="text-center mb-4">Log In</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {!isValidEmail && <Alert variant="danger">Email address is not verified <Alert.Link>Resend verification code</Alert.Link></Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group id="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" ref={emailRef} required/>
                    </Form.Group>
                    <Form.Group id="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" ref={passwordRef} required/>
                    </Form.Group>
                    <Button disabled={isLoading} className="w-100" type="submit">Log In</Button>
                </Form>
                <div className="w-100 text-center mt-3">
                    <Link to="/reset/password">Forgot Password?</Link>
                </div>   
            </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
            Need an account? <Link to="/register">Create an account</Link>
        </div>
        </>
    )
}
