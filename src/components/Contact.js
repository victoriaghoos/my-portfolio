import React from 'react';
import '../styles/contact.scss';

const Contact = () => (
  <section className="contact">
    <h2>Contact</h2>
    <form>
      <label>Name</label>
      <input type="text" name="name" />
      <label>Email</label>
      <input type="email" name="email" />
      <label>Message</label>
      <textarea name="message"></textarea>
      <button type="submit">Send</button>
    </form>
  </section>
);

export default Contact;