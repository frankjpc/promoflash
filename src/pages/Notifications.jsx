import React from 'react';
import './CustomerTabs.css';

export default function Notifications() {
  const notifications = [
    { title: "Summer Sale Is On", subtitle: "Top experiences up to 80% off", highlight: "USE CODE SUMMER", extra: "16264+ used today • Expiring in 1 day" },
    { title: "Unwind This Summer", subtitle: "Top massage, spa & head spa deals", highlight: "USE CODE RELAX", extra: "28313+ used today • Expiring in 1 day" },
    { title: "Celebrate Friendship Day", subtitle: "Treat your best friend to an experience", highlight: "Featured", extra: "3 days ago" },
    { title: "Gear Up for Back to School", subtitle: "From dorm & tech to beauty", highlight: "", extra: "3 days ago" },
  ];

  return (
    <div className="tab-container">
      <h2 className="header-title">Notifications</h2>

      <div className="notifications-list">
        {notifications.map((n, i) => (
          <div key={i} className="notification-item">
            <div className="notif-img"></div>
            <div className="notif-details">
              <h4>{n.title}</h4>
              <p>{n.subtitle}</p>
              {n.highlight && <span className="notif-highlight">{n.highlight}</span>}
              <small>{n.extra}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
