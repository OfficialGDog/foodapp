import React, { useRef, useState, useCallback } from 'react';
import { Form, Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Register() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const [error, setError] = useState();
    const [message, setMessage] = useState();
    const [isLoading, setLoading] = useState(false);
    const auth = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();
        // Validation checks

        if(passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError('Passwords do not match')
        }

        try {
            setLoading(true);
            console.log(emailRef.current.value + passwordRef.current.value);
            const user = await auth.register({email: emailRef.current.value, password: passwordRef.current.value});
            await auth.verifyEmail(user);
            setMessage(`An Email has been sent to: ${user.email}`);
        } catch (error) {
            setError(error.message);
        }

        setLoading(false);        
    }

    return (
        <>
        <Card>
            <Card.Body>
                <h2 className="text-center mb-4">Sign Up</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group id="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" ref={emailRef} required disabled={isLoading}/>
                    </Form.Group>
                    <Form.Group id="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" ref={passwordRef} required disabled={isLoading}/>
                    </Form.Group>
                    <Form.Group id="password-confirm">
                        <Form.Label>Password Confirmation</Form.Label>
                        <Form.Control type="password" ref={passwordConfirmRef} required disabled={isLoading}/>
                    </Form.Group>
                    <Button disabled={isLoading} className="w-100" type="submit">Sign Up</Button>
                </Form>
            </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
            Already have an account? <Link to="/login">Log In</Link>
        </div>
        </>
    )
}
