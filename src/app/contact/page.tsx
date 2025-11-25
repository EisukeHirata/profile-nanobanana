"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./contact.module.css";

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual email sending logic
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <button onClick={() => router.push("/")} className={styles.backButton}>
          ← Back to Home
        </button>

        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.subtitle}>
          Have questions or need support? We're here to help.
        </p>

        <div className={styles.content}>
          <div className={styles.contactInfo}>
            <h2>Get in Touch</h2>
            <div className={styles.infoItem}>
              <h3>📧 Email Support</h3>
              <p>support@nanoprofile.com</p>
              <p className={styles.note}>We typically respond within 24 hours</p>
            </div>
            <div className={styles.infoItem}>
              <h3>💬 Business Inquiries</h3>
              <p>business@nanoprofile.com</p>
            </div>
            <div className={styles.infoItem}>
              <h3>⏰ Support Hours</h3>
              <p>Monday - Friday: 9:00 AM - 6:00 PM (JST)</p>
              <p>Saturday - Sunday: Closed</p>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Send us a Message</h2>
            {submitted ? (
              <div className={styles.successMessage}>
                <h3>✓ Message Sent!</h3>
                <p>Thank you for contacting us. We'll get back to you soon.</p>
                <button onClick={() => setSubmitted(false)} className={styles.resetButton}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={styles.input}
                  >
                    <option value="">Select a subject</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="refund">Refund Request</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className={styles.textarea}
                  />
                </div>

                <button type="submit" className={styles.submitButton}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
