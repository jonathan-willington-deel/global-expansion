import React from 'react'
import './TopNav.css'

function Divider() {
  return <div className="topnav__divider" role="separator" aria-orientation="vertical" />
}

function LogoMark() {
  return (
    <a className="topnav__logo" href="/" aria-label="Deel home">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M1 13.5463C1 8.3857 4.23082 6.09247 7.77347 6.09247C11.0068 6.09247 12.3702 8.18712 12.3702 8.18712V2H15.8722V17.2475C15.8722 18.4992 15.9144 19.6285 16 20.6356H12.3713V18.9243C12.3713 18.9243 10.9819 21 7.77467 21C4.35549 21 1 18.9996 1 13.5463ZM8.66787 18.2603C11.1481 18.2603 12.7516 16.3356 12.7516 13.5463C12.7516 10.6594 11.147 8.8322 8.66787 8.8322C6.18888 8.8322 4.64349 10.5691 4.64349 13.5463C4.64349 16.5233 6.25397 18.2603 8.66787 18.2603Z" fill="currentColor" />
        <path d="M18 17H22V21H18V17Z" fill="currentColor" />
      </svg>
    </a>
  )
}

function OrgSwitcher() {
  return (
    <button className="topnav__org">
      <span className="topnav__org-avatar" aria-hidden>
        <img alt="Org avatar" src="https://hostedboringavatars.vercel.app/api/bauhaus?name=2860522&size=150" />
      </span>
      <span className="topnav__org-text">
        <span className="topnav__org-name">Wayne Enterprise</span>
        <span className="topnav__org-sub">All groups</span>
      </span>
      <span className="topnav__chevron" aria-hidden>
        <svg viewBox="0 0 24 24"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"></path></svg>
      </span>
    </button>
  )
}

function NavLink({ href, icon, label, ariaLabel }) {
  return (
    <a className="topnav__link" href={href} aria-label={ariaLabel || label}>
      <span className="topnav__link-icon" aria-hidden>{icon}</span>
      <span className="topnav__link-label">{label}</span>
    </a>
  )
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden><path d="m12 5.69 5 4.5V18h-2v-6H9v6H7v-7.81zM12 3 2 12h3v8h6v-6h2v6h6v-8h3z" /></svg>
  )
}
function IconPeople() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden><path fillRule="evenodd" d="M16.67 13.13C18.04 14.06 19 15.32 19 17v3h4v-3c0-2.18-3.57-3.47-6.33-3.87"/><circle cx="9" cy="8" r="4" /><path fillRule="evenodd" d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4c-.47 0-.91.1-1.33.24C14.5 5.27 15 6.58 15 8s-.5 2.73-1.33 3.76c.42.14.86.24 1.33.24m-6 1c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4"/></svg>
  )
}
function IconPayroll() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42"/></svg>
  )
}
function IconEngage() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden><path d="M12 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3m0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1m0 5c-1.84 0-3.56.5-5.03 1.37-.61.35-.97 1.02-.97 1.72V17h12v-1.91c0-.7-.36-1.36-.97-1.72C15.56 12.5 13.84 12 12 12"/></svg>
  )
}
function IconDots() { return (<svg viewBox="0 0 24 24" aria-hidden><path d="M4 8h4V4H4zm6 12h4v-4h-4zm-6 0h4v-4H4zm0-6h4v-4H4zm6 0h4v-4h-4zm6-10v4h4V4zm-6 4h4V4h-4zm6 6h4v-4h-4zm0 6h4v-4h-4z"/></svg>) }
function IconSearch() { return (<svg viewBox="0 0 24 24" aria-hidden><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"/></svg>) }
function IconSettings() { return (<svg viewBox="0 0 24 24" aria-hidden><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1q-.09-.03-.18-.03c-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1q.09.03.18.03c.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64zm-1.98-1.71c.04.31.05.52.05.73s-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2"/></svg>) }
function IconHelp() { return (<svg viewBox="0 0 24 24" aria-hidden><path d="M11 18h2v-2h-2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4"/></svg>) }
function IconBell() { return (<svg viewBox="0 0 24 24" aria-hidden><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2m6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5z"/></svg>) }

export default function TopNav() {
  return (
    <div className="topnav" role="navigation" aria-label="Primary">
      <div className="topnav__left">
        <LogoMark />
        <Divider />
        <OrgSwitcher />
      </div>
      <div className="topnav__center">
        <NavLink href="/" icon={<IconHome />} label="Home" />
        <NavLink href="/people" icon={<IconPeople />} label="People" />
        <NavLink href="/payments/due" icon={<IconPayroll />} label="Payroll" />
        <NavLink href="/engage" icon={<IconEngage />} label="Engage" />
        <button className="topnav__more">
          <span className="topnav__link-icon" aria-hidden><IconDots /></span>
          <span className="topnav__link-label">More</span>
          <span className="topnav__chevron" aria-hidden><svg viewBox="0 0 24 24"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg></span>
        </button>
      </div>
      <div className="topnav__right">
        <button className="topnav__iconbtn" aria-label="Search">
          <span className="topnav__icon"><IconSearch /></span>
          <span className="topnav__kbd">⌘K</span>
        </button>
        <button className="topnav__iconbtn" aria-label="Organization settings"><span className="topnav__icon"><IconSettings /></span></button>
        <button className="topnav__iconbtn" aria-label="Help"><span className="topnav__icon"><IconHelp /></span></button>
        <button className="topnav__iconbtn topnav__iconbtn--badge" aria-label="Notifications">
          <span className="topnav__badge">1</span>
          <span className="topnav__icon"><IconBell /></span>
        </button>
        <button className="topnav__avatar" aria-label="Profile">
          <span className="topnav__avatar-initials">BL</span>
        </button>
      </div>
    </div>
  )
}


