import React, { useRef, useState } from 'react'
import { Form, Card, Button, Alert } from 'react-bootstrap'
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"

export default function ForgotPassword() {
    const emailRef = useRef()
    const { resetPassword } = useAuth()
    const [error, setError] = useState()
    const [message, setMessage] = useState()
    const [isLoading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault();
        // Validation check
        try {
            setLoading(true)
            await resetPassword(emailRef.current.value)
            setMessage("Email has been sent")
        } catch {
            setError('Failed to reset password')
        }

        setLoading(false)
        
    }

    return (
        <>
        <Card>
            <Card.Body>
                <h2 className="text-center mb-4">Reset Password</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group id="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" ref={emailRef} required/>
                    </Form.Group>
                    <Button disabled={isLoading} className="w-100" type="submit">Reset Password</Button>
                </Form>
                <div className="w-100 text-center mt-3">
                    <Link to="/login">I remember my password</Link>
                </div>   
            </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
            Need an account? <Link to="/register">Create an account</Link>
        </div>
        </>
    )
}
