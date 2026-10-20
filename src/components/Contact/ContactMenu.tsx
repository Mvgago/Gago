import React from "react";
import { Link } from "react-router-dom";

export const EMAIL = "hola@fugahaus.com";
export const INSTAGRAM = "https://www.instagram.com/fugahaus/";

/**
 * The email address as the way in: it leads to the contact form at the foot of the studio page,
 * where a message is sent straight from the site. The address stays written out for those who
 * would rather copy it.
 */
export const ContactMenu: React.FC = () => (
  <Link to="/about#contact" className="group relative inline-flex items-center lowercase text-graphite">
    {/* A band of light travels through the letters while hovered */}
    <span className="glint">{EMAIL}</span>
  </Link>
);