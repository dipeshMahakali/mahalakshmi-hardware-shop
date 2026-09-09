import React from 'react';
import { BarChart3, Hammer, Home, LogOut, Package, Receipt, Users, Wallet } from 'lucide-react';

export function AdminPanelShell({ children, onLogout }) {
  return (
    <div className="panel-app admin-panel-app">
      <aside className="panel-sidebar">
        <a className="panel-brand" href="/">
          <span className="panel-brand-mark">SM</span>
          <span><strong>Shree Mahalaxmi</strong><small>Owner workspace</small></span>
        </a>
        <nav className="panel-nav" aria-label="Admin navigation">
          <a className="is-active" href="/admin"><BarChart3 size={18} /> Dashboard</a>
          <a href="/admin#billing"><Receipt size={18} /> New Bill</a>
          <a href="/admin#customers"><Users size={18} /> Customers</a>
          <a href="/admin#inventory"><Package size={18} /> Inventory</a>
          <a href="/admin#khata"><Wallet size={18} /> Khata</a>
        </nav>
        {onLogout && <button className="panel-logout" onClick={onLogout}><LogOut size={17} /> Sign out</button>}
      </aside>
      <main className="panel-main">
        <header className="panel-topbar">
          <div><span className="panel-eyebrow">SHOP OWNER WORKSPACE</span><h1>Good day, owner</h1></div>
          <a className="panel-public-link" href="/"><Home size={16} /> View public shop</a>
        </header>
        <div className="panel-content">{children}</div>
      </main>
    </div>
  );
}

export function PartnerPanelShell({ children }) {
  return (
    <div className="partner-app panel-app">
      <header className="partner-topbar">
        <a className="panel-brand" href="/"><span className="panel-brand-mark partner-mark"><Hammer size={18} /></span><span><strong>Carpenter Partner</strong><small>Simple shop assistant</small></span></a>
        <a className="partner-shop-link" href="/"><Home size={16} /> Public shop</a>
      </header>
      <main className="partner-content">{children}</main>
      <nav className="partner-bottom-nav" aria-label="Partner navigation">
        <a className="is-active" href="/partner"><Home size={17} /> Home</a>
        <a href="/partner#order"><Hammer size={17} /> Order</a>
        <a href="/partner#projects"><Package size={17} /> Projects</a>
        <a href="/partner#khata"><Wallet size={17} /> Khata</a>
      </nav>
    </div>
  );
}
