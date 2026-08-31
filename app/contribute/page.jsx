"use client"
import { useEffect } from "react"

export default function Contribute() {
    useEffect(() => {
        window.location.replace("https://docs.google.com/forms/d/e/1FAIpQLSfO3cgvkv83yIqXkngAEoyskUY0kv4GS8l6jOBWurtNJnCNbw/viewform")
    }, [])

    return null
}