import React, { useState, useEffect, useMemo } from 'react';
import { History, Edit2, Archive, Trash2, CheckCircle, RotateCcw, Loader2, X } from 'lucide-react';
import './AttendanceTable.css';

const AttendanceTable = ({
  students,
  isArchivesView,
  onDelete,
  onEdit,
  onArchive,
  onUnarchive,
  onMarkAttendance,
  onFinishSession,
  onNewWeek,
  currentWeekDate,
  onDateChange,
  weeksHistory,
  onSelectHistoryWeek,
  selectedWeekData,
  onCloseHistoryDetail,
  onResetAll,
  onUpdatePayment,
  onUpdateNotes,
  onViewHistory,
  finishedSessions,
  setFinishedSessions,
  customAlert,
  customConfirm,
  isLoading
}) => {
  const isSundayOnly = (p) => {
    if (!p) return false;
    return p.dimanche?.unique &&
      !p.mardi?.matin &&
      !p.mercredi?.matin && !p.mercredi?.amidi &&
      !p.samedi?.matin && !p.samedi?.amidi;
  };


  const [loadingCheck, setLoadingCheck] = useState(null); // { studentId, sessionKey }
  const [loadingSession, setLoadingSession] = useState(null); // sessionKey
  const [isWeeksHistoryModalOpen, setIsWeeksHistoryModalOpen] = useState(false);
  const [sessionModal, setSessionModal] = useState(null); // { key, label, day }

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Number of students per page

  const filteredAndSortedStudents = useMemo(() => {
    const overrideEyaNaes = [
      [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ], // 1
      [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ], // 2
      [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ], // 3
      [ {d:"25-juin", t:"present"}, {d:"28-juin", t:"present"}, {d:"01-juil.", t:"present"}, {d:"02-juil.", t:"present"}, {d:"08-juil.", t:"present"}, {d:"09-juil.", t:"present"}, {d:"15-juil.", t:"present"}, {d:"16-juil.", t:"present"} ], // 4
      [ {d:"22-juil.", t:"present"}, {d:"23-juil.", t:"present"}, {d:"29-juil.", t:"present"}, {d:"30-juil.", t:"present"}, {d:"05-août", t:"absent"}, {d:"06-août", t:"absent"}, {d:"12-août", t:"absent"}, {d:"13-août", t:"absent"} ], // 5
      [ {d:"19-août", t:"absent"}, {d:"20-août", t:"absent"}, {d:"26-août", t:"absent"}, {d:"27-août", t:"absent"}, {d:"02-sept.", t:"absent"}, {d:"03-sept.", t:"absent"}, {d:"09-sept.", t:"present"}, {d:"10-sept.", t:"present"} ], // 6
      [ {d:"16-sept.", t:"present"}, {d:"17-sept.", t:"present"}, {d:"23-sept.", t:"present"}, {d:"24-sept.", t:"present"}, {d:"30-sept.", t:"present"}, {d:"01-oct.", t:"absent"}, {d:"07-oct.", t:"absent"}, {d:"08-oct.", t:"present"} ], // 7
      [ {d:"22-nov.", t:"present"}, {d:"22-nov.", t:"present"}, {d:"29-nov.", t:"present"}, {d:"29-nov.", t:"present"}, {d:"06-déc.", t:"absent"}, {d:"06-déc.", t:"absent"}, {d:"13-déc.", t:"present"}, {d:"13-déc.", t:"present"} ], // 8
      [ {d:"20-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"27-déc.", t:"present"}, {d:"27-déc.", t:"present"}, {d:"03-janv.", t:"present"}, {d:"03-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"10-janv.", t:"present"} ], // 9
      [ {d:"17-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"31-janv.", t:"present"}, {d:"31-janv.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"14-févr.", t:"present"}, {d:"14-févr.", t:"present"} ], // 10
      [ {d:"21-févr.", t:"present"}, {d:"28-févr.", t:"present"}, {d:"28-févr.", t:"present"}, {d:"07-mars", t:"present"}, {d:"07-mars", t:"present"}, {d:"14-mars", t:"present"}, {d:"14-mars", t:"present"}, {d:"28-mars", t:"absent"} ], // 11
      [ {d:"28-mars", t:"absent"}, {d:"04-avr.", t:"absent"}, {d:"04-avr.", t:"absent"} ] // 12
    ];

    const overrideNesrineNafati = [
      [ {d:"22-juin", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ], // 1
      [ {d:"03-août", t:"present"}, {d:"10-août", t:"present"}, {d:"17-août", t:"absent"}, {d:"24-août", t:"present"}, {d:"31-août", t:"present"} ], // 2
      [ {d:"07-sept.", t:"present"}, {d:"14-sept.", t:"present"}, {d:"21-sept.", t:"present"}, {d:"28-sept.", t:"present"}, {d:"05-oct.", t:"present"} ], // 3
      [ {d:"12-oct.", t:"present"}, {d:"26-oct.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"09-nov.", t:"present"}, {d:"16-nov.", t:"present"} ], // 4
      [ {d:"23-nov.", t:"present"}, {d:"30-nov.", t:"present"}, {d:"07-déc.", t:"present"}, {d:"14-déc.", t:"present"}, {d:"21-déc.", t:"present"} ], // 5
      [ {d:"04-janv.", t:"present"}, {d:"11-janv.", t:"present"}, {d:"18-janv.", t:"present"}, {d:"25-janv.", t:"present"}, {d:"01-févr.", t:"present"} ], // 6
      [ {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"01-mars", t:"present"}, {d:"15-mars", t:"present"}, {d:"--", t:"present"} ], // 7
      [ {d:"05-avr.", t:"present"} ] // 8
    ];

    let result = students.map(s => {
      let sTemp = { ...s };

      if (sTemp.name?.toUpperCase() === "EYA NAES") {
        let simulatedHistory = [];
        overrideEyaNaes.forEach(month => {
          month.forEach(session => {
            if (session) simulatedHistory.push({ type: session.t, date: new Date() });
          });
        });
        if (sTemp.cycleHistory && sTemp.cycleHistory.length > 0) {
          sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        }
        
        sTemp = { 
          ...sTemp, 
          totalSessionsCount: 91 + (sTemp.cycleHistory?.length || 0),
          simulatedHistory 
        };
      } else if (sTemp.name?.toUpperCase() === "NESRINE NAFATI") {
        let simulatedHistory = [];
        overrideNesrineNafati.forEach(month => {
          month.forEach(session => {
            simulatedHistory.push({ type: session.t, date: new Date() });
          });
        });
        if (sTemp.cycleHistory && sTemp.cycleHistory.length > 0) {
          sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        }
        
        // 36 sessions from the manual override
        sTemp = { 
          ...sTemp, 
          totalSessionsCount: 36 + (sTemp.cycleHistory?.length || 0),
          simulatedHistory 
        };
      } else if (sTemp.name?.toUpperCase() === "MALEK KEMEL") {
        const overrideMalekKemel = [
          [ {d:"01-févr.", t:"present"}, {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"22-févr.", t:"absent"}, {d:"01-mars", t:"present"} ] // 1
        ];
        let simulatedHistory = [];
        overrideMalekKemel.forEach(month => {
          month.forEach(session => {
            if (session) simulatedHistory.push({ type: session.t, date: new Date() });
          });
        });
        if (sTemp.cycleHistory && sTemp.cycleHistory.length > 0) {
          sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        }
        
        // 5 sessions from the manual override
        sTemp = { 
          ...sTemp, 
          totalSessionsCount: 5 + (sTemp.cycleHistory?.length || 0),
          simulatedHistory 
        };
      } else if (sTemp.name?.toUpperCase() === "YOSRA BEN ALI") {
        const overrideYosraBenAli = [
          [ {d:"01-févr.", t:"present"}, {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"22-févr.", t:"present"}, {d:"01-mars", t:"present"} ], // M1
          [ {d:"08-mars", t:"present"}, {d:"15-mars", t:"present"} ] // M2
        ];
        let simulatedHistory = [];
        overrideYosraBenAli.forEach(month => {
          month.forEach(session => {
            if (session) simulatedHistory.push({ type: session.t, date: new Date() });
          });
        });
        if (sTemp.cycleHistory && sTemp.cycleHistory.length > 0) {
          sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        }
        
        // 7 sessions from the manual override
        sTemp = { 
          ...sTemp, 
          totalSessionsCount: 7 + (sTemp.cycleHistory?.length || 0),
          simulatedHistory 
        };
      } else if (sTemp.name?.toUpperCase() === "IMEN SAFI") {
        const overrideImenSafi = [
          [ {d:"01-févr.", t:"present"}, {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"22-févr.", t:"present"}, {d:"01-mars", t:"present"} ], // M1
          [ {d:"05-avr.", t:"present"} ] // M2
        ];
        let simulatedHistory = [];
        overrideImenSafi.forEach(month => {
          month.forEach(session => {
            if (session) simulatedHistory.push({ type: session.t, date: new Date() });
          });
        });
        if (sTemp.cycleHistory && sTemp.cycleHistory.length > 0) {
          sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        }
        
        // 6 sessions from the manual override
        sTemp = { 
          ...sTemp, 
          totalSessionsCount: 6 + (sTemp.cycleHistory?.length || 0),
          simulatedHistory 
        };
      } else if (sTemp.name?.toUpperCase() === "EMNA LWETTI") {
        const overrideEmnaLouetti = [
          [ {d:"11-janv.", t:"present"}, {d:"18-janv.", t:"present"}, {d:"25-janv.", t:"present"}, {d:"01-févr.", t:"present"}, {d:"08-févr.", t:"present"} ], // 1
          [ {d:"15-févr.", t:"present"}, {d:"22-févr.", t:"present"}, {d:"15-mars", t:"absent"} ] // 2
        ];
        let simulatedHistory = [];
        overrideEmnaLouetti.forEach(month => {
          month.forEach(session => {
            if (session) simulatedHistory.push({ type: session.t, date: new Date() });
          });
        });
        if (sTemp.cycleHistory && sTemp.cycleHistory.length > 0) {
          sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        }
        sTemp = { 
          ...sTemp, 
          totalSessionsCount: 8 + (sTemp.cycleHistory?.length || 0),
          simulatedHistory 
        };
      } else if (sTemp.name?.toUpperCase() === "HANA BRLGHITH") {
        const overrideHanaBelghith = [
          [ {d:"25-janv.", t:"present"}, {d:"01-févr.", t:"present"}, {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"22-févr.", t:"present"} ], // 1
          [ {d:"01-mars", t:"absent"}, {d:"08-mars", t:"absent"}, {d:"15-mars", t:"absent"} ] // 2
        ];
        let simulatedHistory = [];
        overrideHanaBelghith.forEach(month => {
          month.forEach(session => {
            if (session) simulatedHistory.push({ type: session.t, date: new Date() });
          });
        });
        if (sTemp.cycleHistory && sTemp.cycleHistory.length > 0) {
          sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        }
        sTemp = { 
          ...sTemp, 
          totalSessionsCount: 8 + (sTemp.cycleHistory?.length || 0),
          simulatedHistory 
        };
      } else if (sTemp.name?.toUpperCase() === "NESRINE DRADRA") {
        const overrideNesrineDradra = [
          [ {d:"01-févr.", t:"present"}, {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"22-févr.", t:"absent"}, {d:"01-mars", t:"present"} ], // 1
          [ {d:"08-mars", t:"present"}, {d:"15-mars", t:"absent"} ] // 2
        ];
        let simulatedHistory = [];
        overrideNesrineDradra.forEach(month => {
          month.forEach(session => {
            if (session) simulatedHistory.push({ type: session.t, date: new Date() });
          });
        });
        if (sTemp.cycleHistory && sTemp.cycleHistory.length > 0) {
          sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        }
        sTemp = { 
          ...sTemp, 
          totalSessionsCount: 7 + (sTemp.cycleHistory?.length || 0),
          simulatedHistory 
        };
      } else if (sTemp.name?.toUpperCase() === "OMAYMA HMIDET") {
        const override = [
          [ {d:"07-déc.", t:"present"}, {d:"14-déc.", t:"present"}, {d:"21-déc.", t:"present"}, {d:"28-déc.", t:"present"}, {d:"04-janv.", t:"present"} ],
          [ {d:"11-janv.", t:"present"}, {d:"18-janv.", t:"present"}, {d:"25-janv.", t:"present"}, {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"present"} ],
          [ {d:"22-févr.", t:"present"}, {d:"01-mars", t:"absent"}, {d:"08-mars", t:"present"}, {d:"15-mars", t:"absent"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 14 + (sTemp.cycleHistory?.length || 0), simulatedHistory };
      } else if (sTemp.name?.toUpperCase() === "RAWAA BOUZIDI") {
        const override = [
          [ {d:"04-janv.", t:"present"}, {d:"11-janv.", t:"present"}, {d:"18-janv.", t:"present"}, {d:"25-janv.", t:"present"}, {d:"01-févr.", t:"present"} ],
          [ {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"22-févr.", t:"present"}, {d:"01-mars", t:"absent"}, {d:"08-mars", t:"present"} ],
          [ {d:"15-mars", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 11 + (sTemp.cycleHistory?.length || 0), simulatedHistory };
      } else if (sTemp.name?.toUpperCase() === "EMNA GHODHBEN") {
        const override = [
          [ {d:"21-déc.", t:"present"}, {d:"28-déc.", t:"present"}, {d:"31-déc.", t:"present"}, {d:"11-janv.", t:"present"}, {d:"18-janv.", t:"present"} ],
          [ {d:"25-janv.", t:"present"}, {d:"01-févr.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"present"} ],
          [ {d:"22-févr.", t:"present"}, {d:"01-mars", t:"present"}, {d:"08-mars", t:"present"}, {d:"15-mars", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 14 + (sTemp.cycleHistory?.length || 0), simulatedHistory };
      } else if (sTemp.name?.toUpperCase() === "IBTISSEM BDLEWI") {
        const override = [
          [ {d:"09-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"23-nov.", t:"present"}, {d:"30-nov.", t:"present"}, {d:"07-دéc.", t:"present"} ],
          [ {d:"14-دéc.", t:"absent"}, {d:"21-دéc.", t:"present"}, {d:"28-دéc.", t:"absent"}, {d:"04-janv.", t:"absent"}, {d:"11-janv.", t:"absent"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 10 + (sTemp.cycleHistory?.length || 0), simulatedHistory };
      } else if (sTemp.name?.toUpperCase() === "MALEK MKAWAR") {
        const override = [
          [ {d:"05-oct.", t:"present"}, {d:"19-oct.", t:"present"}, {d:"26-oct.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"09-nov.", t:"present"} ],
          [ {d:"16-nov.", t:"present"}, {d:"23-nov.", t:"present"}, {d:"30-nov.", t:"present"}, {d:"07-déc.", t:"present"}, {d:"14-déc.", t:"present"} ],
          [ {d:"21-déc.", t:"present"}, {d:"28-déc.", t:"present"}, {d:"04-janv.", t:"absent"}, {d:"11-janv.", t:"present"}, {d:"18-janv.", t:"present"} ],
          [ {d:"25-janv.", t:"present"}, {d:"01-févr.", t:"present"}, {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"22-févr.", t:"present"} ],
          [ {d:"01-mars", t:"present"}, {d:"08-mars", t:"present"}, {d:"15-mars", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 23 + (sTemp.cycleHistory?.length || 0), simulatedHistory };
      } else if (sTemp.name?.toUpperCase() === "SIWAR KAABECHI") {
        const override = [
          [ {d:"12-oct.", t:"present"}, {d:"19-oct.", t:"present"}, {d:"26-oct.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"09-nov.", t:"present"} ],
          [ {d:"16-nov.", t:"present"}, {d:"23-nov.", t:"present"}, {d:"30-nov.", t:"present"}, {d:"07-déc.", t:"present"}, {d:"14-déc.", t:"absent"} ],
          [ {d:"21-déc.", t:"present"}, {d:"28-déc.", t:"absent"}, {d:"04-janv.", t:"absent"}, {d:"11-janv.", t:"absent"}, {d:"18-janv.", t:"absent"} ],
          [ {d:"25-janv.", t:"absent"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 16 + (sTemp.cycleHistory?.length || 0), simulatedHistory };
      } else if (sTemp.name?.toUpperCase() === "BASSMA HAMDEWI") {
        const override = [
          [ {d:"12-oct.", t:"present"}, {d:"19-oct.", t:"present"}, {d:"26-oct.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"09-nov.", t:"present"} ],
          [ {d:"16-nov.", t:"present"}, {d:"23-nov.", t:"present"}, {d:"30-nov.", t:"present"}, {d:"07-déc.", t:"present"}, {d:"14-déc.", t:"present"} ],
          [ {d:"21-déc.", t:"present"}, {d:"28-déc.", t:"present"}, {d:"04-janv.", t:"present"}, {d:"11-janv.", t:"present"}, {d:"18-janv.", t:"present"} ],
          [ {d:"25-janv.", t:"present"}, {d:"01-févr.", t:"present"}, {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"22-févr.", t:"present"} ],
          [ {d:"01-mars", t:"absent"}, {d:"08-mars", t:"present"}, {d:"15-mars", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 23 + (sTemp.cycleHistory?.length || 0), simulatedHistory };
      } else if (sTemp.name?.toUpperCase() === "SALWA HANI") {
        const override = [
          [ {d:"19-oct.", t:"present"}, {d:"26-oct.", t:"present"}, {d:"02-nov.", t:"absent"}, {d:"09-nov.", t:"present"}, {d:"16-nov.", t:"present"} ],
          [ {d:"23-nov.", t:"present"}, {d:"30-nov.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"14-déc.", t:"absent"}, {d:"21-déc.", t:"absent"} ],
          [ {d:"28-déc.", t:"absent"}, {d:"04-janv.", t:"absent"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 12 + (sTemp.cycleHistory?.length || 0), simulatedHistory };
      } else if (sTemp.name?.toUpperCase() === "MAISSA BEN NASER") {
        const override = [
          [ {d:"07-sept.", t:"present"}, {d:"14-sept.", t:"present"}, {d:"21-sept.", t:"present"}, {d:"28-sept.", t:"present"}, {d:"05-oct.", t:"present"} ],
          [ {d:"12-oct.", t:"absent"}, {d:"19-oct.", t:"present"}, {d:"26-oct.", t:"absent"}, {d:"02-nov.", t:"present"}, {d:"09-nov.", t:"present"} ],
          [ {d:"16-nov.", t:"present"}, {d:"23-nov.", t:"present"}, {d:"30-nov.", t:"present"}, {d:"07-déc.", t:"present"}, {d:"14-déc.", t:"present"} ],
          [ {d:"21-déc.", t:"present"}, {d:"28-déc.", t:"absent"}, {d:"04-janv.", t:"absent"}, {d:"11-janv.", t:"absent"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 19 + (sTemp.cycleHistory?.length || 0), simulatedHistory };
      } else if (sTemp.name?.toUpperCase() === "TAKWA HARCHI") {
        const override = [
          [ {d:"05-oct.", t:"present"}, {d:"12-oct.", t:"present"}, {d:"19-oct.", t:"present"}, {d:"26-oct.", t:"present"}, {d:"02-nov.", t:"absent"} ],
          [ {d:"09-nov.", t:"present"}, {d:"16-nov.", t:"present"}, {d:"23-nov.", t:"present"}, {d:"30-nov.", t:"present"}, {d:"07-déc.", t:"present"} ],
          [ {d:"14-déc.", t:"absent"}, {d:"21-déc.", t:"absent"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 12 + (sTemp.cycleHistory?.length || 0), simulatedHistory };
      } else if (sTemp.name?.toUpperCase() === "MARIEM TRABELSI") {
        const override = [
          [ {d:"06-juil.", t:"present"}, {d:"13-juil.", t:"present"}, {d:"20-juil.", t:"present"}, {d:"27-juil.", t:"present"}, {d:"03-août", t:"present"} ],
          [ {d:"10-août", t:"present"}, {d:"17-août", t:"present"}, {d:"24-août", t:"present"}, {d:"31-août", t:"present"} ],
          [ {d:"14-août", t:"present"}, {d:"21-sept.", t:"present"}, {d:"28-sept.", t:"present"}, {d:"05-oct.", t:"present"}, {d:"12-oct.", t:"present"} ],
          [ {d:"19-oct.", t:"present"}, {d:"26-oct.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"09-nov.", t:"present"}, {d:"16-nov.", t:"present"} ],
          [ {d:"23-nov.", t:"present"}, {d:"30-nov.", t:"present"}, {d:"07-déc.", t:"present"}, {d:"14-déc.", t:"present"}, {d:"21-déc.", t:"present"} ],
          [ {d:"28-déc.", t:"present"}, {d:"04-janv.", t:"present"}, {d:"11-janv.", t:"present"}, {d:"18-janv.", t:"present"}, {d:"25-janv.", t:"present"} ],
          [ {d:"01-mars", t:"present"}, {d:"08-mars", t:"absent"}, {d:"15-mars", t:"absent"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 32 + (sTemp.cycleHistory?.length || 0), simulatedHistory };
      } else if (sTemp.name?.toUpperCase() === "RIHAB BOUALI") {
        const override = [
          [ {d:"23-févr.", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"27-juil.", t:"present"}, {d:"03-août", t:"present"}, {d:"10-août", t:"present"}, {d:"17-août", t:"absent"}, {d:"24-août", t:"present"} ],
          [ {d:"31-août", t:"present"}, {d:"07-sept.", t:"present"}, {d:"14-sept.", t:"present"}, {d:"21-sept.", t:"present"}, {d:"28-sept.", t:"present"} ],
          [ {d:"05-oct.", t:"present"}, {d:"12-oct.", t:"present"}, {d:"19-oct.", t:"present"}, {d:"26-oct.", t:"absent"}, {d:"02-nov.", t:"present"} ],
          [ {d:"09-nov.", t:"present"}, {d:"16-nov.", t:"present"}, {d:"23-nov.", t:"present"}, {d:"30-nov.", t:"present"}, {d:"07-déc.", t:"present"} ],
          [ {d:"14-déc.", t:"present"}, {d:"21-déc.", t:"present"}, {d:"28-déc.", t:"present"}, {d:"04-janv.", t:"present"}, {d:"11-janv.", t:"present"} ],
          [ {d:"18-janv.", t:"present"}, {d:"25-janv.", t:"present"}, {d:"01-févr.", t:"present"}, {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"absent"} ],
          [ {d:"22-févr.", t:"present"}, {d:"01-mars", t:"present"}, {d:"08-mars", t:"present"}, {d:"15-mars", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 54 + (sTemp.cycleHistory?.length || 0), simulatedHistory };
      } else if (sTemp.name?.toUpperCase() === "AICHA HERCHI") {
        const override = [
          [ {d:"16-févr.", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"06-juil.", t:"present"}, {d:"13-juil.", t:"present"}, {d:"20-juil.", t:"present"}, {d:"27-juil.", t:"present"}, {d:"03-août", t:"present"} ],
          [ {d:"10-août", t:"present"}, {d:"17-août", t:"present"}, {d:"24-août", t:"present"}, {d:"31-août", t:"present"}, {d:"07-sept.", t:"absent"} ],
          [ {d:"14-sept.", t:"absent"}, {d:"21-sept.", t:"present"}, {d:"28-sept.", t:"present"}, {d:"05-oct.", t:"present"}, {d:"12-oct.", t:"present"} ],
          [ {d:"19-oct.", t:"present"}, {d:"26-oct.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"09-nov.", t:"present"}, {d:"16-nov.", t:"present"} ],
          [ {d:"23-nov.", t:"present"}, {d:"30-nov.", t:"present"}, {d:"07-déc.", t:"present"}, {d:"14-déc.", t:"present"}, {d:"24-déc.", t:"present"} ],
          [ {d:"28-déc.", t:"absent"}, {d:"04-janv.", t:"absent"}, {d:"11-janv.", t:"present"}, {d:"18-janv.", t:"present"}, {d:"25-janv.", t:"absent"} ],
          [ {d:"01-févr.", t:"present"}, {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"22-févr.", t:"present"}, {d:"01-mars", t:"present"} ],
          [ {d:"08-mars", t:"present"}, {d:"15-mars", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 57 + (sTemp.cycleHistory?.length || 0), simulatedHistory };
      } else if (sTemp.name?.toUpperCase() === "MANEL YOUSFI") {
        const override = [
          [ {d:"12-janv.", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"17-août", t:"absent"}, {d:"24-août", t:"present"}, {d:"31-août", t:"present"}, {d:"07-sept.", t:"present"}, {d:"14-sept.", t:"present"} ],
          [ {d:"21-sept.", t:"present"}, {d:"28-sept.", t:"present"}, {d:"05-oct.", t:"present"}, {d:"12-oct.", t:"present"}, {d:"19-oct.", t:"present"} ],
          [ {d:"26-oct.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"09-nov.", t:"present"}, {d:"16-nov.", t:"present"}, {d:"23-nov.", t:"present"} ],
          [ {d:"30-nov.", t:"present"}, {d:"07-déc.", t:"present"}, {d:"14-déc.", t:"absent"}, {d:"21-déc.", t:"present"}, {d:"28-déc.", t:"absent"} ],
          [ {d:"04-janv.", t:"present"}, {d:"11-janv.", t:"absent"}, {d:"18-janv.", t:"absent"}, {d:"25-janv.", t:"present"} ],
          [ {d:"01-févr.", t:"present"}, {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"22-févr.", t:"present"}, {d:"01-mars", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 61 + (sTemp.cycleHistory?.length || 0), simulatedHistory };
      } else if (sTemp.name?.toUpperCase() === "RIM HIDRI") {
        const override = [
          [ {d:"19-janv.", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"17-août", t:"present"}, {d:"24-août", t:"present"}, {d:"31-août", t:"present"}, {d:"07-sept.", t:"present"}, {d:"14-sept.", t:"present"} ],
          [ {d:"21-sept.", t:"present"}, {d:"28-sept.", t:"present"}, {d:"05-oct.", t:"present"}, {d:"12-oct.", t:"absent"}, {d:"19-oct.", t:"present"} ],
          [ {d:"26-oct.", t:"absent"}, {d:"02-nov.", t:"present"}, {d:"09-nov.", t:"present"}, {d:"23-nov.", t:"present"}, {d:"30-nov.", t:"present"} ],
          [ {d:"07-déc.", t:"present"}, {d:"14-déc.", t:"present"}, {d:"21-déc.", t:"present"}, {d:"28-déc.", t:"present"}, {d:"04-janv.", t:"present"} ],
          [ {d:"11-janv.", t:"present"}, {d:"18-janv.", t:"present"}, {d:"25-janv.", t:"present"}, {d:"01-févr.", t:"present"}, {d:"08-févr.", t:"present"} ],
          [ {d:"15-févr.", t:"absent"}, {d:"22-févr.", t:"present"}, {d:"01-mars", t:"present"}, {d:"08-mars", t:"present"}, {d:"15-mars", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 60 + (sTemp.cycleHistory?.length || 0), simulatedHistory };
      } else if (sTemp.name?.toUpperCase() === "WIDED AHMER") {
        const override = [
          [ {d:"05-janv.", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"29-juin", t:"present"}, {d:"06-juil.", t:"present"}, {d:"13-juil.", t:"present"}, {d:"20-juil.", t:"present"}, {d:"27-juil.", t:"present"} ],
          [ {d:"03-août", t:"present"}, {d:"10-août", t:"present"}, {d:"17-août", t:"present"}, {d:"24-août", t:"present"}, {d:"31-août", t:"present"} ],
          [ {d:"07-sept.", t:"absent"}, {d:"14-sept.", t:"present"}, {d:"21-sept.", t:"present"}, {d:"28-sept.", t:"present"}, {d:"05-oct.", t:"present"} ],
          [ {d:"12-oct.", t:"present"}, {d:"19-oct.", t:"absent"}, {d:"26-oct.", t:"present"}, {d:"02-nov.", t:"absent"}, {d:"09-nov.", t:"present"} ],
          [ {d:"16-nov.", t:"present"}, {d:"09-nov.", t:"present"}, {d:"16-nov.", t:"present"}, {d:"23-nov.", t:"present"}, {d:"30-nov.", t:"present"} ],
          [ {d:"07-déc", t:"present"}, {d:"14-déc", t:"present"}, {d:"21-déc", t:"present"}, {d:"28-déc", t:"present"}, {d:"04-janv.", t:"absent"} ],
          [ {d:"11-janv.", t:"present"}, {d:"18-janv.", t:"present"}, {d:"25-janv.", t:"present"}, {d:"01-févr.", t:"present"}, {d:"08-févr.", t:"present"} ],
          [ {d:"08-mars", t:"present"}, {d:"15-mars", t:"present"} ],
          [ {d:"29-mars", t:"absent"}, {d:"05-avr.", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 67 + (sTemp.cycleHistory?.length || 0), simulatedHistory };
      } else if (sTemp.name?.trim().toUpperCase() === "SIHEM SALAH") {
        const override = [
           [{d:"01-nov.", t:"present"}],
           [{d:"10-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"20-déc.", t:"absent"}, {d:"27-déc.", t:"present"}, {d:"03-janv.", t:"present"}, {d:"03-janv.", t:"present"}],
           [{d:"10-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"24-janv.", t:"absent"}, {d:"24-janv.", t:"absent"}, {d:"31-janv.", t:"present"}, {d:"31-janv.", t:"present"}],
           [{d:"07-mars", t:"present"}, {d:"07-mars", t:"present"}, {d:"14-mars", t:"present"}, {d:"14-mars", t:"present"}, {d:"28-mars", t:"present"}, {d:"28-mars", t:"present"}, {d:"04-avr.", t:"absent"}, {d:"04-avr.", t:"absent"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 23 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.toUpperCase() === "YOSRA BEN TAHER") {
        const override = [
          [ {d:"22-sept.", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"03-août", t:"present"}, {d:"10-août", t:"present"}, {d:"17-août", t:"present"}, {d:"24-août", t:"present"}, {d:"31-août", t:"present"} ],
          [ {d:"07-sept.", t:"present"}, {d:"14-sept.", t:"present"}, {d:"21-sept.", t:"absent"}, {d:"28-sept.", t:"present"}, {d:"05-oct.", t:"absent"} ],
          [ {d:"12-oct.", t:"present"}, {d:"19-oct.", t:"present"}, {d:"26-oct.", t:"present"}, {d:"02-nov.", t:"present"} ],
          [ {d:"16-nov.", t:"present"}, {d:"09-nov.", t:"present"}, {d:"16-nov.", t:"present"}, {d:"23-nov.", t:"present"}, {d:"30-nov.", t:"present"} ],
          [ {d:"07-déc.", t:"present"}, {d:"14-déc.", t:"present"}, {d:"21-déc.", t:"present"}, {d:"28-déc.", t:"present"}, {d:"04-janv.", t:"present"} ],
          [ {d:"11-janv.", t:"present"}, {d:"18-janv.", t:"present"}, {d:"25-janv.", t:"present"}, {d:"01-févr.", t:"absent"}, {d:"08-févr.", t:"present"} ],
          [ {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"22-févr.", t:"present"}, {d:"01-mars", t:"absent"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 78 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: 45 + (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.toUpperCase() === "RIHAB BOUHLEL") {
        const override = [
          [ {d:"01-sept.", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"06-juil.", t:"present"}, {d:"13-juil.", t:"present"}, {d:"20-juil.", t:"present"}, {d:"27-juil.", t:"present"}, {d:"03-août", t:"present"} ],
          [ {d:"10-août", t:"present"}, {d:"17-août", t:"absent"}, {d:"24-août", t:"present"}, {d:"31-août", t:"present"}, {d:"07-sept.", t:"present"} ],
          [ {d:"21-sept.", t:"present"}, {d:"28-sept.", t:"present"}, {d:"05-oct.", t:"present"}, {d:"12-oct.", t:"absent"}, {d:"19-oct.", t:"present"} ],
          [ {d:"26-oct.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"09-nov.", t:"present"}, {d:"16-nov.", t:"present"}, {d:"23-nov.", t:"present"} ],
          [ {d:"30-nov.", t:"present"}, {d:"07-déc.", t:"absent"}, {d:"14-déc.", t:"present"}, {d:"21-déc.", t:"present"}, {d:"28-déc.", t:"present"} ],
          [ {d:"04-janv.", t:"present"}, {d:"11-janv.", t:"present"}, {d:"18-janv.", t:"present"}, {d:"25-janv.", t:"present"}, {d:"01-févr.", t:"present"} ],
          [ {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"22-févr.", t:"present"}, {d:"01-mars", t:"absent"}, {d:"08-mars", t:"present"} ],
          [ {d:"15-mars", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 81 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: 60 + (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.toUpperCase() === "MARWA HENTATI") {
        const override = [
          [ {d:"20-oct.", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"20-juil.", t:"present"}, {d:"27-juil.", t:"present"}, {d:"03-août", t:"present"}, {d:"10-août", t:"present"}, {d:"17-août", t:"present"} ],
          [ {d:"24-août", t:"present"}, {d:"31-août", t:"present"}, {d:"07-sept.", t:"present"}, {d:"14-sept.", t:"present"}, {d:"21-sept.", t:"present"} ],
          [ {d:"28-sept.", t:"present"}, {d:"05-oct.", t:"present"}, {d:"12-oct.", t:"present"}, {d:"19-oct.", t:"present"}, {d:"26-oct.", t:"present"} ],
          [ {d:"02-nov.", t:"absent"}, {d:"09-nov.", t:"present"}, {d:"16-nov.", t:"present"}, {d:"23-nov.", t:"present"}, {d:"30-nov.", t:"present"} ],
          [ {d:"07-déc.", t:"absent"}, {d:"14-déc.", t:"present"}, {d:"21-déc.", t:"present"}, {d:"28-déc.", t:"present"}, {d:"04-janv.", t:"absent"} ],
          [ {d:"11-janv.", t:"present"}, {d:"18-janv.", t:"present"}, {d:"25-janv.", t:"present"}, {d:"01-févr.", t:"present"}, {d:"08-févr.", t:"present"} ],
          [ {d:"15-févr.", t:"present"}, {d:"22-févr.", t:"present"}, {d:"01-mars", t:"present"}, {d:"08-mars", t:"present"}, {d:"15-mars", t:"absent"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 75 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: 60 + (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.toUpperCase() === "ARBIA HARATHI") {
        const override = [
          [ {d:"27-oct.", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"}, {d:"--", t:"present"} ],
          [ {d:"03-août", t:"present"}, {d:"10-août", t:"present"}, {d:"17-août", t:"present"}, {d:"24-août", t:"present"}, {d:"31-août", t:"present"} ],
          [ {d:"18-janv.", t:"present"}, {d:"25-janv.", t:"present"}, {d:"01-févr.", t:"present"}, {d:"08-févr.", t:"present"}, {d:"15-févr.", t:"present"} ],
          [ {d:"22-févr.", t:"present"}, {d:"01-mars", t:"present"}, {d:"08-mars", t:"present"}, {d:"15-mars", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 60 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: 40 + (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "ARIJ MNASRI") {
        const override = [
          [ {d:"08-avr.", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 1 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "HANEN BELAAYEB") {
        const override = [
          [ {d:"31-mars", t:"present"}, {d:"01-avr.", t:"present"}, {d:"07-avr.", t:"present"}, {d:"08-avr.", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 4 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "CHAHINEZ MEJDOUB") {
        const override = [
          [ {d:"08-janv.", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 1 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "DHEKRA GLISSI") {
        const override = [
          [ {d:"04-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"25-mars", t:"present"}, {d:"25-mars", t:"present"}, {d:"01-avr.", t:"present"}, {d:"08-avr.", t:"present"}, {d:"08-avr.", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 8 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "YASSMINE GUIDARA") {
        const override = [
          [ {d:"24-janv.", t:"present"}, {d:"24-janv.", t:"present"}, {d:"31-janv.", t:"present"}, {d:"31-janv.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"17-févr.", t:"present"}, {d:"14-févr.", t:"present"} ],
          [ {d:"04-avr.", t:"present"}, {d:"05-avr.", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 10 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "NADA CHIHA") {
        const override = [
          [ {d:"03-mars", t:"present"}, {d:"04-mars", t:"present"}, {d:"10-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"24-mars", t:"present"}, {d:"25-mars", t:"present"}, {d:"31-mars", t:"present"}, {d:"01-avr.", t:"present"} ],
          [ {d:"07-avr.", t:"present"}, {d:"08-avr.", t:"present"} ]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 10 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "EMNA AKROUT") {
        const override = [
          [{ d: "27-janv.", t: "present" }, { d: "28-janv.", t: "present" }, { d: "03-févr.", t: "present" }, { d: "04-févr.", t: "present" }, { d: "10-févr.", t: "present" }, { d: "11-févr.", t: "present" }, { d: "17-févr.", t: "present" }, { d: "18-févr.", t: "present" }],
          [{ d: "24-févr.", t: "present" }, { d: "25-févr.", t: "present" }, { d: "03-mars", t: "present" }, { d: "04-mars", t: "present" }, { d: "10-mars", t: "present" }, { d: "11-mars", t: "present" }, { d: "24-mars", t: "present" }, { d: "25-mars", t: "present" }],
          [{ d: "31-mars", t: "present" }, { d: "01-avr.", t: "present" }, { d: "08-avr.", t: "present" }]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 19 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "OMAYMA HLELI") {
        const override = [
          [{ d: "10-févr.", t: "present" }, { d: "11-févr.", t: "present" }, { d: "17-févr.", t: "present" }, { d: "18-févr.", t: "present" }, { d: "24-févr.", t: "present" }, { d: "25-févr.", t: "present" }, { d: "03-mars", t: "present" }, { d: "10-mars", t: "present" }],
          [{ d: "24-mars", t: "present" }, { d: "25-mars", t: "present" }, { d: "31-mars", t: "present" }, { d: "01-avr.", t: "present" }, { d: "07-avr.", t: "present" }, { d: "08-avr.", t: "present" }]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 14 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "EYA ABIDA") {
        const override = [
          [{ d: "13-janv.", t: "present" }, { d: "17-janv.", t: "present" }, { d: "20-janv.", t: "present" }, { d: "24-janv.", t: "present" }, { d: "27-janv.", t: "present" }, { d: "31-janv.", t: "present" }, { d: "03-févr.", t: "present" }, { d: "07-févr.", t: "present" }],
          [{ d: "10-févr.", t: "present" }, { d: "14-févr.", t: "present" }, { d: "17-févr.", t: "present" }, { d: "24-févr.", t: "present" }, { d: "28-févr.", t: "present" }, { d: "03-mars", t: "present" }, { d: "07-mars", t: "present" }, { d: "10-mars", t: "present" }]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 16 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "OMAYMA BEN NASSER") {
        const override = [
          [{ d: "24-janv.", t: "present" }, { d: "24-janv.", t: "present" }, { d: "31-janv.", t: "present" }, { d: "31-janv.", t: "present" }, { d: "07-févr.", t: "present" }, { d: "07-févr.", t: "present" }, { d: "14-févr.", t: "present" }, { d: "14-févr.", t: "present" }],
          [{ d: "28-mars", t: "present" }, { d: "28-mars", t: "present" }, { d: "04-avr.", t: "present" }, { d: "04-avr.", t: "present" }]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 12 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "MAYSSAM BOULILA") {
        const override = [
          [{ d: "10-déc.", t: "present" }, { d: "16-déc.", t: "present" }, { d: "17-déc.", t: "present" }, { d: "23-déc.", t: "present" }, { d: "24-déc.", t: "present" }, { d: "30-déc.", t: "present" }, { d: "31-déc.", t: "present" }, { d: "13-janv.", t: "present" }],
          [{ d: "13-janv.", t: "present" }, { d: "14-janv.", t: "present" }, { d: "20-janv.", t: "present" }, { d: "21-janv.", t: "present" }, { d: "27-janv.", t: "present" }, { d: "28-janv.", t: "present" }, { d: "03-févr.", t: "present" }, { d: "04-janv.", t: "present" }],
          [{ d: "10-févr.", t: "present" }, { d: "11-févr.", t: "present" }, { d: "17-févr.", t: "present" }, { d: "18-févr.", t: "present" }, { d: "24-févr.", t: "present" }, { d: "25-févr.", t: "present" }, { d: "03-mars", t: "present" }, { d: "04-mars", t: "present" }],
          [{ d: "10-mars", t: "present" }, { d: "11-mars", t: "present" }, { d: "28-mars", t: "present" }, { d: "29-mars", t: "present" }, { d: "31-mars", t: "present" }, { d: "01-avr.", t: "present" }, { d: "07-avr.", t: "present" }, { d: "08-avr.", t: "present" }]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 32 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "AMENI KARWI") {
        const override = [
          [{d:"06-déc.", t:"present"}, {d:"06-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"27-déc.", t:"absent"}, {d:"27-déc.", t:"absent"}],
          [{d:"03-janv.", t:"absent"}, {d:"03-janv.", t:"absent"}, {d:"10-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"18-janv.", t:"present"}, {d:"18-janv.", t:"present"}, {d:"25-janv.", t:"present"}, {d:"25-janv.", t:"present"}],
          [{d:"31-janv.", t:"present"}, {d:"31-janv.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"14-févr.", t:"present"}, {d:"14-févr.", t:"present"}, {d:"21-févr.", t:"absent"}, {d:"21-févr.", t:"absent"}],
          [{d:"28-févr.", t:"present"}, {d:"28-févr.", t:"present"}, {d:"07-mars", t:"present"}, {d:"07-mars", t:"present"}, {d:"14-mars", t:"absent"}, {d:"14-mars", t:"absent"}, {d:"28-mars", t:"present"}, {d:"28-mars", t:"present"}],
          [{d:"04-avr.", t:"present"}, {d:"04-avr.", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 34 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "MOUNA DRIRA") {
        const override = [
          [{d:"03-janv.", t:"present"}, {d:"06-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"14-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"21-janv.", t:"present"}, {d:"07-févr.", t:"absent"}, {d:"11-févr.", t:"present"}],
          [{d:"14-févr.", t:"absent"}, {d:"18-févr.", t:"absent"}, {d:"21-févr.", t:"absent"}, {d:"25-févr.", t:"absent"}, {d:"28-févr.", t:"present"}, {d:"04-mars", t:"present"}, {d:"07-mars", t:"absent"}, {d:"11-mars", t:"present"}],
          [{d:"14-mars", t:"present"}, {d:"25-mars", t:"present"}, {d:"28-mars", t:"present"}, {d:"01-avr.", t:"present"}, {d:"04-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 22 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "MARIEM ZOUARI") {
        const override = [
          [{d:"05-nov.", t:"present"}, {d:"11-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"19-nov.", t:"present"}, {d:"25-nov.", t:"present"}, {d:"26-nov.", t:"present"}, {d:"02-nov.", t:"present"}],
          [{d:"03-déc.", t:"present"}, {d:"09-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"16-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"23-déc.", t:"present"}, {d:"24-déc.", t:"present"}, {d:"30-déc.", t:"absent"}],
          [{d:"31-déc.", t:"absent"}, {d:"06-janv.", t:"present"}, {d:"07-janv.", t:"present"}, {d:"13-janv.", t:"absent"}, {d:"14-janv.", t:"absent"}, {d:"20-janv.", t:"present"}, {d:"21-janv.", t:"present"}, {d:"27-janv.", t:"present"}],
          [{d:"28-janv.", t:"present"}, {d:"03-févr.", t:"present"}, {d:"04-janv.", t:"present"}, {d:"10-févr.", t:"present"}, {d:"11-févr.", t:"present"}, {d:"17-févr.", t:"present"}, {d:"18-févr.", t:"present"}, {d:"24-févr.", t:"present"}],
          [{d:"25-févr.", t:"present"}, {d:"03-mars", t:"present"}, {d:"04-mars", t:"present"}, {d:"10-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"24-mars", t:"absent"}, {d:"25-mars", t:"present"}, {d:"31-mars", t:"present"}],
          [{d:"01-avr.", t:"present"}, {d:"07-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 43 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "HALIMA CHMISSI") {
        const override = [
          [{d:"22-oct.", t:"present"}, {d:"22-oct.", t:"present"}, {d:"29-oct.", t:"absent"}, {d:"29-oct.", t:"absent"}, {d:"05-nov.", t:"present"}, {d:"05-nov.", t:"present"}, {d:"08-nov.", t:"present"}, {d:"08-nov.", t:"present"}],
          [{d:"12-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"19-nov.", t:"absent"}, {d:"19-nov.", t:"absent"}, {d:"22-nov.", t:"absent"}, {d:"22-nov.", t:"absent"}],
          [{d:"06-déc.", t:"present"}, {d:"06-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"17-déc.", t:"present"}],
          [{d:"20-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"24-déc.", t:"present"}, {d:"24-déc.", t:"present"}, {d:"27-déc.", t:"present"}, {d:"27-déc.", t:"present"}, {d:"31-déc.", t:"present"}, {d:"31-déc.", t:"present"}],
          [{d:"03-janv.", t:"absent"}, {d:"03-janv.", t:"absent"}, {d:"07-janv.", t:"present"}, {d:"07-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"14-janv.", t:"present"}, {d:"14-janv.", t:"present"}],
          [{d:"21-janv.", t:"present"}, {d:"21-janv.", t:"present"}, {d:"28-janv.", t:"present"}, {d:"28-janv.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"11-févr.", t:"present"}, {d:"11-févr.", t:"present"}],
          [{d:"21-févr.", t:"present"}, {d:"21-févr.", t:"present"}, {d:"25-févr.", t:"present"}, {d:"25-févr.", t:"present"}, {d:"28-févr.", t:"present"}, {d:"28-févr.", t:"present"}, {d:"03-mars", t:"present"}, {d:"04-mars", t:"present"}], 
          [{d:"04-mars", t:"present"}, {d:"07-mars", t:"present"}, {d:"07-mars", t:"present"}, {d:"10-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"14-mars", t:"present"}, {d:"14-mars", t:"present"}],
          [{d:"25-mars", t:"absent"}, {d:"25-mars", t:"absent"}, {d:"28-mars", t:"absent"}, {d:"28-mars", t:"absent"}, {d:"08-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 70 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "MAISSA MALLEK") {
        const override = [
          [{d:"14-oct.", t:"present"}, {d:"15-oct.", t:"present"}, {d:"21-oct.", t:"present"}, {d:"22-oct.", t:"present"}, {d:"28-oct.", t:"present"}, {d:"29-oct.", t:"present"}, {d:"04-nov.", t:"present"}, {d:"05-nov.", t:"present"}],
          [{d:"11-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"25-nov.", t:"present"}, {d:"26-nov.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"03-déc.", t:"present"}, {d:"09-déc.", t:"absent"}],
          [{d:"10-déc.", t:"absent"}, {d:"16-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"23-déc.", t:"present"}, {d:"24-déc.", t:"present"}, {d:"30-déc.", t:"present"}, {d:"31-déc.", t:"absent"}, {d:"06-janv.", t:"present"}],
          [{d:"07-janv.", t:"absent"}, {d:"13-janv.", t:"present"}, {d:"14-janv.", t:"present"}, {d:"20-janv.", t:"present"}, {d:"21-janv.", t:"present"}, {d:"27-janv.", t:"present"}, {d:"03-févr.", t:"present"}, {d:"04-févr.", t:"present"}],
          [{d:"10-févr.", t:"present"}, {d:"11-févr.", t:"present"}, {d:"17-févr.", t:"present"}, {d:"18-févr.", t:"present"}, {d:"03-mars", t:"present"}, {d:"04-mars", t:"present"}, {d:"10-mars", t:"present"}, {d:"11-mars", t:"present"}],
          [{d:"24-mars", t:"absent"}, {d:"25-mars", t:"absent"}, {d:"31-mars", t:"present"}, {d:"01-avr.", t:"present"}, {d:"07-avr.", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 45 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "SOUAD HAMZA") {
        const override = [
          [{d:"11-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"19-nov.", t:"present"}, {d:"25-nov.", t:"present"}, {d:"26-nov.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"03-déc.", t:"present"}],
          [{d:"09-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"16-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"23-déc.", t:"absent"}, {d:"24-déc.", t:"present"}, {d:"30-déc.", t:"present"}, {d:"31-déc.", t:"present"}],
          [{d:"06-janv.", t:"present"}, {d:"07-janv.", t:"absent"}, {d:"13-janv.", t:"present"}, {d:"14-janv.", t:"present"}, {d:"20-janv.", t:"present"}, {d:"21-janv.", t:"present"}, {d:"27-janv.", t:"present"}, {d:"28-janv.", t:"present"}],
          [{d:"03-févr.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"10-févr.", t:"absent"}, {d:"11-févr.", t:"present"}, {d:"17-févr.", t:"present"}, {d:"18-févr.", t:"present"}, {d:"24-févr.", t:"present"}, {d:"25-févr.", t:"present"}],
          [{d:"03-mars", t:"present"}, {d:"04-mars", t:"present"}, {d:"10-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"28-mars", t:"present"}, {d:"28-mars", t:"present"}, {d:"31-mars", t:"present"}, {d:"01-avr.", t:"present"}],
          [{d:"07-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 42 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "SOUHIR GOMRI") {
        const override = [
          [{d:"14-oct.", t:"present"}, {d:"15-oct.", t:"present"}, {d:"21-oct.", t:"present"}, {d:"22-oct.", t:"absent"}, {d:"28-oct.", t:"present"}, {d:"29-oct.", t:"present"}, {d:"29-oct.", t:"present"}, {d:"04-nov.", t:"present"}],
          [{d:"11-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"19-nov.", t:"present"}, {d:"25-nov.", t:"absent"}, {d:"26-nov.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"03-déc.", t:"present"}],
          [{d:"09-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"16-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"23-déc.", t:"present"}, {d:"24-déc.", t:"present"}, {d:"30-déc.", t:"present"}, {d:"31-déc.", t:"absent"}],
          [{d:"03-janv.", t:"present"}, {d:"06-janv.", t:"present"}, {d:"07-janv.", t:"absent"}, {d:"13-janv.", t:"present"}, {d:"14-janv.", t:"present"}, {d:"20-janv.", t:"present"}, {d:"21-janv.", t:"present"}, {d:"27-janv.", t:"present"}],
          [{d:"03-janv.", t:"absent"}, {d:"04-févr.", t:"present"}, {d:"10-févr.", t:"absent"}, {d:"11-févr.", t:"absent"}, {d:"17-févr.", t:"present"}, {d:"18-févr.", t:"present"}, {d:"24-févr.", t:"absent"}, {d:"03-mars", t:"present"}],
          [{d:"04-mars", t:"present"}, {d:"10-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"24-mars", t:"absent"}, {d:"25-mars", t:"absent"}, {d:"31-mars", t:"absent"}, {d:"01-avr.", t:"absent"}, {d:"07-avr.", t:"absent"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 48 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "RAWYA CHTOUROU") {
        const override = [
          [{d:"07-oct.", t:"present"}, {d:"11-oct.", t:"present"}, {d:"14-oct.", t:"present"}, {d:"18-oct.", t:"present"}, {d:"21-oct.", t:"present"}, {d:"25-oct.", t:"present"}, {d:"28-oct.", t:"present"}, {d:"01-nov.", t:"present"}],
          [{d:"04-nov.", t:"present"}, {d:"08-nov.", t:"absent"}, {d:"11-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"19-nov.", t:"absent"}, {d:"25-nov.", t:"present"}, {d:"26-nov.", t:"present"}],
          [{d:"02-nov.", t:"present"}, {d:"09-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"16-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"23-déc.", t:"present"}, {d:"27-déc.", t:"present"}, {d:"30-déc.", t:"present"}],
          [{d:"03-janv.", t:"present"}, {d:"06-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"13-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"20-janv.", t:"present"}, {d:"24-janv.", t:"present"}, {d:"27-janv.", t:"present"}],
          [{d:"31-janv.", t:"present"}, {d:"07-févr.", t:"absent"}, {d:"10-févr.", t:"present"}, {d:"14-févr.", t:"absent"}, {d:"17-févr.", t:"present"}, {d:"21-févr.", t:"present"}, {d:"24-févr.", t:"present"}, {d:"28-févr.", t:"present"}],
          [{d:"03-mars", t:"absent"}, {d:"07-mars", t:"present"}, {d:"10-mars", t:"absent"}, {d:"14-mars", t:"absent"}, {d:"25-mars", t:"absent"}, {d:"28-mars", t:"present"}, {d:"31-mars", t:"absent"}, {d:"04-avr.", t:"present"}],
          [{d:"07-avr.", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 49 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "MARIEM BOUJELBEN") {
        const override = [
          [{d:"01-oct.", t:"present"}, {d:"04-oct.", t:"present"}, {d:"08-oct.", t:"present"}, {d:"08-oct.", t:"present"}, {d:"15-oct.", t:"present"}, {d:"15-oct.", t:"present"}, {d:"22-oct.", t:"present"}, {d:"22-oct.", t:"present"}],
          [{d:"29-oct.", t:"present"}, {d:"29-oct.", t:"present"}, {d:"05-nov.", t:"present"}, {d:"05-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"19-nov.", t:"present"}, {d:"19-nov.", t:"present"}],
          [{d:"26-nov.", t:"present"}, {d:"26-nov.", t:"present"}, {d:"03-déc.", t:"present"}, {d:"03-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"17-déc.", t:"absent"}],
          [{d:"24-déc.", t:"present"}, {d:"24-déc.", t:"present"}, {d:"31-déc.", t:"present"}, {d:"31-déc.", t:"present"}, {d:"07-janv.", t:"absent"}, {d:"07-janv.", t:"absent"}, {d:"21-janv.", t:"present"}, {d:"21-janv.", t:"present"}],
          [{d:"28-janv.", t:"present"}, {d:"28-janv.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"11-févr.", t:"absent"}, {d:"11-févr.", t:"present"}, {d:"18-févr.", t:"present"}, {d:"18-févr.", t:"present"}],
          [{d:"25-févr.", t:"present"}, {d:"25-févr.", t:"present"}, {d:"04-mars", t:"present"}, {d:"04-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"25-mars", t:"present"}, {d:"25-mars", t:"present"}],
          [{d:"01-avr.", t:"present"}, {d:"01-avr.", t:"present"}, {d:"08-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 52 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "WAFA HAMEDI") {
        const override = [
          [{d:"04-oct.", t:"present"}, {d:"08-oct.", t:"present"}, {d:"11-oct.", t:"present"}, {d:"15-oct.", t:"present"}, {d:"18-oct.", t:"present"}, {d:"22-oct.", t:"present"}, {d:"25-oct.", t:"present"}, {d:"29-oct.", t:"present"}],
          [{d:"01-nov.", t:"present"}, {d:"05-nov.", t:"absent"}, {d:"08-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"19-nov.", t:"present"}, {d:"22-nov.", t:"present"}, {d:"26-nov.", t:"present"}],
          [{d:"29-nov.", t:"present"}, {d:"03-déc.", t:"present"}, {d:"06-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"24-déc.", t:"present"}],
          [{d:"27-déc.", t:"present"}, {d:"31-déc.", t:"absent"}, {d:"03-janv.", t:"present"}, {d:"07-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"14-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"24-janv.", t:"present"}],
          [{d:"24-janv.", t:"present"}, {d:"31-janv.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"11-févr.", t:"present"}, {d:"14-févr.", t:"present"}, {d:"18-févr.", t:"present"}, {d:"21-févr.", t:"present"}],
          [{d:"25-févr.", t:"present"}, {d:"01-avr.", t:"present"}, {d:"04-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 44 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "RANIA TAKTAK") {
        const override = [
          [{d:"07-oct.", t:"present"}, {d:"11-oct.", t:"present"}, {d:"14-oct.", t:"present"}, {d:"18-oct.", t:"present"}, {d:"21-oct.", t:"present"}, {d:"25-oct.", t:"present"}, {d:"28-oct.", t:"present"}, {d:"01-nov.", t:"present"}],
          [{d:"04-nov.", t:"present"}, {d:"08-nov.", t:"present"}, {d:"11-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"22-nov.", t:"present"}, {d:"25-nov.", t:"absent"}, {d:"29-nov.", t:"present"}],
          [{d:"02-déc.", t:"present"}, {d:"06-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"16-déc.", t:"present"}, {d:"20-déc.", t:"absent"}, {d:"23-déc.", t:"absent"}, {d:"27-déc.", t:"present"}, {d:"30-déc.", t:"present"}],
          [{d:"03-janv.", t:"present"}, {d:"06-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"13-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"20-janv.", t:"present"}, {d:"24-janv.", t:"present"}, {d:"27-janv.", t:"present"}],
          [{d:"31-janv.", t:"present"}, {d:"03-févr.", t:"absent"}, {d:"07-févr.", t:"present"}, {d:"10-févr.", t:"present"}, {d:"14-févr.", t:"present"}, {d:"17-févr.", t:"present"}, {d:"21-févr.", t:"absent"}, {d:"24-févr.", t:"present"}],
          [{d:"28-févr.", t:"present"}, {d:"03-mars", t:"absent"}, {d:"07-mars", t:"present"}, {d:"10-mars", t:"present"}, {d:"14-mars", t:"present"}, {d:"24-mars", t:"present"}, {d:"28-mars", t:"present"}, {d:"31-mars", t:"present"}],
          [{d:"04-avr.", t:"absent"}, {d:"07-avr.", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 50 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "CHAYMA AYDI") {
        const override = [
          [{d:"01-oct.", t:"present"}, {d:"01-oct.", t:"present"}, {d:"04-oct.", t:"present"}, {d:"04-oct.", t:"present"}, {d:"08-oct.", t:"present"}, {d:"08-oct.", t:"present"}, {d:"11-oct.", t:"present"}, {d:"11-oct.", t:"present"}],
          [{d:"15-oct.", t:"present"}, {d:"15-oct.", t:"present"}, {d:"18-oct.", t:"present"}, {d:"18-oct.", t:"present"}, {d:"22-oct.", t:"present"}, {d:"22-oct.", t:"present"}, {d:"25-oct.", t:"absent"}, {d:"25-oct.", t:"absent"}],
          [{d:"29-oct.", t:"present"}, {d:"29-oct.", t:"present"}, {d:"01-nov.", t:"present"}, {d:"01-nov.", t:"present"}, {d:"05-nov.", t:"present"}, {d:"05-nov.", t:"present"}, {d:"08-nov.", t:"present"}, {d:"08-nov.", t:"present"}],
          [{d:"12-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"19-nov.", t:"present"}, {d:"19-nov.", t:"present"}, {d:"22-nov.", t:"present"}, {d:"22-nov.", t:"present"}],
          [{d:"26-nov.", t:"present"}, {d:"26-nov.", t:"present"}, {d:"29-nov.", t:"present"}, {d:"29-nov.", t:"present"}, {d:"03-déc.", t:"present"}, {d:"03-déc.", t:"present"}, {d:"06-déc.", t:"present"}, {d:"06-déc.", t:"present"}],
          [{d:"10-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"20-déc.", t:"present"}],
          [{d:"24-déc.", t:"present"}, {d:"24-déc.", t:"present"}, {d:"27-déc.", t:"present"}, {d:"27-déc.", t:"present"}, {d:"31-déc.", t:"absent"}, {d:"31-déc.", t:"absent"}, {d:"03-janv.", t:"present"}, {d:"03-janv.", t:"present"}],
          [{d:"07-janv.", t:"present"}, {d:"07-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"14-janv.", t:"absent"}, {d:"14-janv.", t:"absent"}, {d:"17-janv.", t:"present"}, {d:"17-janv.", t:"present"}],
          [{d:"21-janv.", t:"present"}, {d:"21-janv.", t:"present"}, {d:"24-janv.", t:"present"}, {d:"24-janv.", t:"present"}, {d:"28-janv.", t:"present"}, {d:"28-janv.", t:"present"}, {d:"31-janv.", t:"present"}, {d:"31-janv.", t:"present"}],
          [{d:"04-févr.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"11-févr.", t:"present"}, {d:"11-févr.", t:"present"}, {d:"14-févr.", t:"absent"}, {d:"14-févr.", t:"absent"}],
          [{d:"18-févr.", t:"present"}, {d:"18-févr.", t:"present"}, {d:"21-févr.", t:"present"}, {d:"21-févr.", t:"present"}, {d:"25-févr.", t:"present"}, {d:"25-févr.", t:"present"}, {d:"28-févr.", t:"absent"}, {d:"28-févr.", t:"absent"}],
          [{d:"04-mars", t:"present"}, {d:"04-mars", t:"present"}, {d:"07-mars", t:"present"}, {d:"07-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"14-mars", t:"absent"}, {d:"14-mars", t:"absent"}],
          [{d:"01-avr.", t:"present"}, {d:"01-avr.", t:"present"}, {d:"04-avr.", t:"present"}, {d:"04-avr.", t:"present"}, {d:"08-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 102 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "FATMA BEN AYED") {
        const override = [
          [{d:"01-oct.", t:"present"}, {d:"07-oct.", t:"present"}, {d:"08-oct.", t:"present"}, {d:"14-oct.", t:"present"}, {d:"15-oct.", t:"present"}, {d:"21-oct.", t:"present"}, {d:"22-oct.", t:"present"}, {d:"28-oct.", t:"present"}],
          [{d:"29-oct.", t:"present"}, {d:"04-nov.", t:"present"}, {d:"05-nov.", t:"present"}, {d:"11-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"19-nov.", t:"absent"}, {d:"25-nov.", t:"present"}],
          [{d:"26-nov.", t:"present"}, {d:"02-déc.", t:"present"}, {d:"03-déc.", t:"present"}, {d:"09-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"16-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"23-déc.", t:"present"}],
          [{d:"24-déc.", t:"present"}, {d:"30-déc.", t:"present"}, {d:"31-déc.", t:"present"}, {d:"03-janv.", t:"present"}, {d:"06-janv.", t:"present"}, {d:"07-janv.", t:"present"}, {d:"13-janv.", t:"present"}, {d:"14-janv.", t:"present"}],
          [{d:"20-janv.", t:"present"}, {d:"21-janv.", t:"present"}, {d:"27-janv.", t:"present"}, {d:"28-janv.", t:"present"}, {d:"03-févr.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"10-févr.", t:"present"}, {d:"11-févr.", t:"absent"}],
          [{d:"31-mars", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 41 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "RIHEM HAMDI") {
        const override = [
          [{d:"27-sept.", t:"present"}, {d:"04-oct.", t:"present"}, {d:"11-oct.", t:"present"}, {d:"11-oct.", t:"present"}, {d:"18-oct.", t:"present"}, {d:"18-oct.", t:"present"}, {d:"25-oct.", t:"present"}, {d:"25-oct.", t:"present"}],
          [{d:"01-nov.", t:"present"}, {d:"01-nov.", t:"present"}, {d:"08-nov.", t:"present"}, {d:"08-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"22-nov.", t:"present"}, {d:"22-nov.", t:"present"}],
          [{d:"29-nov.", t:"present"}, {d:"29-nov.", t:"present"}, {d:"06-déc.", t:"present"}, {d:"06-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"27-déc.", t:"present"}],
          [{d:"03-janv.", t:"present"}, {d:"03-déc.", t:"present"}, {d:"10-janv.", t:"absent"}, {d:"10-janv.", t:"absent"}, {d:"17-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"24-janv.", t:"present"}, {d:"24-janv.", t:"present"}],
          [{d:"31-janv.", t:"present"}, {d:"31-janv.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"21-févr.", t:"present"}, {d:"21-févr.", t:"present"}],
          [{d:"08-mars", t:"present"}, {d:"08-mars", t:"present"}, {d:"14-mars", t:"absent"}, {d:"14-mars", t:"absent"}, {d:"28-mars", t:"present"}, {d:"28-mars", t:"present"}, {d:"04-avr.", t:"present"}, {d:"04-avr.", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 48 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "HIBA ALLAH CHALBI") {
        const override = [
          [{d:"23-sept.", t:"present"}, {d:"24-sept.", t:"present"}, {d:"30-sept.", t:"present"}, {d:"01-oct.", t:"present"}, {d:"07-oct.", t:"present"}, {d:"08-oct.", t:"present"}, {d:"14-oct.", t:"present"}, {d:"15-oct.", t:"present"}],
          [{d:"21-oct.", t:"present"}, {d:"22-oct.", t:"absent"}, {d:"28-oct.", t:"present"}, {d:"29-oct.", t:"present"}, {d:"04-nov.", t:"present"}, {d:"05-nov.", t:"present"}, {d:"11-nov.", t:"present"}, {d:"12-nov.", t:"present"}],
          [{d:"15-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"22-nov.", t:"present"}, {d:"25-nov.", t:"present"}, {d:"29-nov.", t:"absent"}, {d:"02-nov.", t:"absent"}, {d:"06-déc.", t:"present"}, {d:"09-déc.", t:"present"}],
          [{d:"13-déc.", t:"present"}, {d:"16-déc.", t:"absent"}, {d:"20-déc.", t:"present"}, {d:"23-déc.", t:"present"}, {d:"27-déc.", t:"present"}, {d:"30-déc.", t:"present"}, {d:"03-janv.", t:"present"}, {d:"06-janv.", t:"present"}],
          [{d:"10-janv.", t:"present"}, {d:"13-janv.", t:"present"}, {d:"17-janv.", t:"absent"}, {d:"20-janv.", t:"present"}, {d:"24-janv.", t:"present"}, {d:"27-janv.", t:"present"}, {d:"31-janv.", t:"absent"}, {d:"03-févr.", t:"absent"}],
          [{d:"07-févr.", t:"absent"}, {d:"10-févr.", t:"present"}, {d:"14-févr.", t:"absent"}, {d:"17-févr.", t:"absent"}, {d:"21-févr.", t:"absent"}, {d:"24-févr.", t:"present"}, {d:"28-févr.", t:"absent"}, {d:"03-mars", t:"present"}],
          [{d:"07-mars", t:"absent"}, {d:"10-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"14-mars", t:"present"}, {d:"24-mars", t:"absent"}, {d:"25-mars", t:"absent"}, {d:"31-mars", t:"present"}, {d:"01-avr.", t:"present"}],
          [{d:"07-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 58 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "HAJER NEJI") {
        const override = [
          [{d:"16-sept.", t:"present"}, {d:"17-sept.", t:"present"}, {d:"23-sept.", t:"absent"}, {d:"24-sept.", t:"present"}, {d:"30-sept.", t:"present"}, {d:"01-oct.", t:"present"}, {d:"07-oct.", t:"present"}, {d:"08-oct.", t:"present"}],
          [{d:"14-oct.", t:"present"}, {d:"15-oct.", t:"present"}, {d:"21-oct.", t:"present"}, {d:"22-oct.", t:"present"}, {d:"28-oct.", t:"present"}, {d:"29-oct.", t:"present"}, {d:"04-nov.", t:"absent"}, {d:"05-nov.", t:"present"}],
          [{d:"11-nov.", t:"absent"}, {d:"12-nov.", t:"absent"}, {d:"18-nov.", t:"present"}, {d:"19-nov.", t:"absent"}, {d:"25-nov.", t:"absent"}, {d:"26-nov.", t:"absent"}, {d:"02-nov.", t:"present"}, {d:"03-déc.", t:"present"}],
          [{d:"09-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"16-déc.", t:"absent"}, {d:"17-déc.", t:"present"}, {d:"23-déc.", t:"absent"}, {d:"24-déc.", t:"absent"}, {d:"30-déc.", t:"present"}, {d:"31-déc.", t:"absent"}],
          [{d:"06-janv.", t:"present"}, {d:"07-janv.", t:"present"}, {d:"13-janv.", t:"present"}, {d:"14-janv.", t:"absent"}, {d:"20-janv.", t:"present"}, {d:"21-janv.", t:"present"}, {d:"27-janv.", t:"present"}, {d:"28-janv.", t:"present"}],
          [{d:"03-févr.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"10-févr.", t:"present"}, {d:"11-févr.", t:"present"}, {d:"03-mars", t:"present"}, {d:"04-mars", t:"present"}, {d:"10-mars", t:"present"}, {d:"11-mars", t:"absent"}],
          [{d:"24-mars", t:"present"}, {d:"25-mars", t:"present"}, {d:"31-mars", t:"present"}, {d:"01-avr.", t:"absent"}, {d:"07-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 54 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "HANA ABASSI") {
        const override = [
          [{d:"30-sept.", t:"present"}, {d:"07-oct.", t:"present"}, {d:"08-oct.", t:"present"}, {d:"14-oct.", t:"present"}, {d:"15-oct.", t:"absent"}, {d:"21-oct.", t:"present"}, {d:"22-oct.", t:"present"}, {d:"28-oct.", t:"absent"}],
          [{d:"29-oct.", t:"present"}, {d:"04-nov.", t:"present"}, {d:"05-nov.", t:"absent"}, {d:"11-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"19-nov.", t:"absent"}, {d:"25-nov.", t:"present"}],
          [{d:"26-nov.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"03-déc.", t:"absent"}, {d:"09-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"16-déc.", t:"absent"}, {d:"17-déc.", t:"present"}, {d:"23-déc.", t:"absent"}],
          [{d:"24-déc.", t:"present"}, {d:"30-déc.", t:"present"}, {d:"31-déc.", t:"present"}, {d:"06-janv.", t:"present"}, {d:"07-janv.", t:"present"}, {d:"13-janv.", t:"present"}, {d:"14-janv.", t:"present"}, {d:"20-janv.", t:"present"}],
          [{d:"21-janv.", t:"present"}, {d:"27-janv.", t:"present"}, {d:"28-janv.", t:"present"}, {d:"17-févr.", t:"present"}, {d:"18-févr.", t:"present"}, {d:"25-févr.", t:"present"}, {d:"03-mars", t:"present"}, {d:"04-mars", t:"absent"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 40 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "AMENI TWETI") {
        const override = [
          [{d:"17-sept.", t:"present"}, {d:"20-sept.", t:"present"}, {d:"27-sept.", t:"present"}, {d:"27-sept.", t:"present"}, {d:"04-oct.", t:"present"}, {d:"04-oct.", t:"present"}, {d:"11-oct.", t:"present"}, {d:"11-oct.", t:"present"}],
          [{d:"18-oct.", t:"present"}, {d:"18-oct.", t:"present"}, {d:"25-oct.", t:"present"}, {d:"25-oct.", t:"present"}, {d:"01-nov.", t:"present"}, {d:"01-nov.", t:"present"}, {d:"08-nov.", t:"present"}, {d:"08-nov.", t:"present"}],
          [{d:"15-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"22-nov.", t:"present"}, {d:"22-nov.", t:"present"}, {d:"29-nov.", t:"present"}, {d:"29-nov.", t:"present"}, {d:"06-déc.", t:"present"}, {d:"06-déc.", t:"present"}],
          [{d:"13-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"27-déc.", t:"present"}, {d:"27-déc.", t:"present"}, {d:"03-janv.", t:"absent"}, {d:"03-janv.", t:"absent"}],
          [{d:"10-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"24-janv.", t:"absent"}, {d:"24-janv.", t:"absent"}, {d:"31-janv.", t:"present"}, {d:"31-janv.", t:"present"}],
          [{d:"07-févr.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"14-févr.", t:"present"}, {d:"14-févr.", t:"present"}, {d:"21-févr.", t:"absent"}, {d:"21-févr.", t:"absent"}, {d:"28-févr.", t:"absent"}, {d:"28-févr.", t:"absent"}],
          [{d:"04-avr.", t:"present"}, {d:"04-avr.", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 50 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      } else if (sTemp.name?.trim().toUpperCase() === "SALSABIL HENI") {
        const override = [
          [{d:"16-sept.", t:"present"}, {d:"20-sept.", t:"present"}, {d:"23-sept.", t:"present"}, {d:"27-sept.", t:"present"}, {d:"30-sept.", t:"present"}, {d:"04-oct.", t:"present"}, {d:"07-oct.", t:"present"}, {d:"11-oct.", t:"present"}],
          [{d:"14-oct.", t:"present"}, {d:"18-oct.", t:"present"}, {d:"21-oct.", t:"present"}, {d:"25-oct.", t:"present"}, {d:"28-oct.", t:"present"}, {d:"01-nov.", t:"present"}, {d:"04-nov.", t:"absent"}, {d:"08-nov.", t:"present"}],
          [{d:"11-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"22-nov.", t:"absent"}, {d:"25-nov.", t:"present"}, {d:"29-nov.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"06-déc.", t:"present"}],
          [{d:"09-déc.", t:"absent"}, {d:"13-déc.", t:"present"}, {d:"16-déc.", t:"present"}, {d:"20-déc.", t:"absent"}, {d:"23-déc.", t:"absent"}, {d:"27-déc.", t:"present"}, {d:"30-déc.", t:"present"}, {d:"03-janv.", t:"present"}],
          [{d:"06-janv.", t:"present"}, {d:"10-janv.", t:"absent"}, {d:"13-janv.", t:"absent"}, {d:"17-janv.", t:"present"}, {d:"20-janv.", t:"present"}, {d:"24-janv.", t:"absent"}, {d:"27-janv.", t:"present"}, {d:"31-janv.", t:"present"}],
          [{d:"03-févr.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"10-févr.", t:"present"}, {d:"14-févr.", t:"absent"}, {d:"17-févr.", t:"absent"}, {d:"21-févr.", t:"present"}, {d:"24-févr.", t:"absent"}, {d:"28-févr.", t:"present"}],
          [{d:"03-mars", t:"absent"}, {d:"07-mars", t:"present"}, {d:"10-mars", t:"absent"}, {d:"14-mars", t:"absent"}, {d:"24-mars", t:"absent"}, {d:"28-mars", t:"present"}, {d:"31-mars", t:"absent"}, {d:"04-avr.", t:"present"}],
          [{d:"07-avr.", t:"present"}]
        ];
        let simulatedHistory = [];
        override.forEach(m => m.forEach(s => { if(s) simulatedHistory.push({type: s.t, date: new Date()}) }));
        if (sTemp.cycleHistory) sTemp.cycleHistory.forEach(sess => simulatedHistory.push(sess));
        sTemp = { ...sTemp, totalSessionsCount: 57 + (sTemp.cycleHistory?.length || 0), simulatedHistory, paidSessionsCount: (sTemp.paidSessionsCount || 0) };
      }

      // Dynamic rule: If there are unpaid sessions but status says "Payer", switch to "Non Payer" visually
      const owesSessionsCount = Math.max(0, (sTemp.totalSessionsCount || 0) - (sTemp.paidSessionsCount || 0));
      if (owesSessionsCount > 0 && sTemp.paymentStatus === "Payer / تم الخلاص") {
        sTemp.paymentStatus = "Non Payer / لم يدفع بعد";
      }

      return sTemp;
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q))
      );
    }

    if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'newest') {
      // Assuming new records appear at the end, reverse brings newest first.
      // Alternatively, sort by _id descending.
      result.sort((a, b) => b._id.localeCompare(a._id));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => a._id.localeCompare(b._id));
    }

    return result;
  }, [students, searchQuery, sortBy]);

  // Handle Pagination resets
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, students.length]);

  const totalPages = Math.ceil(filteredAndSortedStudents.length / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedStudents.slice(start, start + itemsPerPage);
  }, [filteredAndSortedStudents, currentPage, itemsPerPage]);

  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handlePageClick = (pageNum) => setCurrentPage(pageNum);

  // Map session keys to planning paths
  const SESSION_PLANNING_MAP = {
    mardi_matin: (p) => p?.mardi?.matin,
    mercredi_matin: (p) => p?.mercredi?.matin,
    mercredi_amidi: (p) => p?.mercredi?.amidi,
    samedi_matin: (p) => p?.samedi?.matin,
    samedi_amidi: (p) => p?.samedi?.amidi,
    dimanche_unique: (p) => p?.dimanche?.unique,
  };

  const openSessionModal = (sessionKey, label, day) => {
    setSessionModal({ sessionKey, label, day });
  };

  const getStudentsForSession = (sessionKey) => {
    const planningFn = SESSION_PLANNING_MAP[sessionKey];
    if (!planningFn) return [];
    return students.filter(s => planningFn(s.planning));
  };

  const handleCheckClick = async (studentId, sessionKey) => {
    setLoadingCheck({ studentId, sessionKey });
    try {
      await onMarkAttendance(studentId, sessionKey);
    } finally {
      setLoadingCheck(null);
    }
  };

  const printAttendanceSheet = (sessionKey, label, day, sessionStudents) => {
    const today = new Date().toLocaleDateString('fr-FR');
    const rows = sessionStudents.map((s, i) => {
      const unpaid = (s.totalSessionsCount || 0) - (s.paidSessionsCount || 0);
      const hasDebt = unpaid > 0;
      const annotation = s.notes || '';
      return `
        <tr>
          <td style="text-align:right; font-weight:700;">
            ${s.name}
            ${hasDebt ? `<br/><span style="font-size:0.72rem; background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; border-radius:4px; padding:2px 6px; display:inline-block; margin-top:3px;">يجب الدفع !!!</span>` : ''}
          </td>
          <td style="text-align:center;"><div style="width:22px;height:22px;border:1.5px solid #94a3b8;border-radius:4px;margin:auto;"></div></td>
          <td style="text-align:center;"><div style="width:22px;height:22px;border:1.5px solid #94a3b8;border-radius:4px;margin:auto;"></div></td>
          <td style="color:#dc2626; font-size:0.8rem; text-align:right;">
            ${hasDebt ? `انتباه: ${unpaid} حصص بدون خلاص` : ''}
            ${annotation ? `<div style="color:#64748b; font-size:0.75rem;">${annotation}</div>` : ''}
          </td>
        </tr>
      `;
    }).join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>Feuille d'appel - ${day} ${label}</title>
        <style>
          @page { size: A4; margin: 1.5cm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; direction: rtl; color: #1e293b; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
          .header-right { text-align: right; }
          .header-right h1 { margin: 0; font-size: 1.3rem; }
          .header-right p { margin: 4px 0 0; font-size: 0.9rem; color: #334155; }
          .header-left { text-align: left; font-size: 0.85rem; color: #475569; }
          hr { border: none; border-top: 2px solid #e2e8f0; margin: 16px 0 24px; }
          table { width: 100%; border-collapse: collapse; }
          thead tr { background: #f8fafc; }
          th, td { border: 1px solid #cbd5e1; padding: 10px 14px; font-size: 0.88rem; }
          th { font-weight: 700; color: #334155; }
          tbody tr:nth-child(even) { background: #f8fafc; }
          .count { margin-top: 24px; font-size: 0.85rem; color: #64748b; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <div>التاريخ: ${today}</div>
          </div>
          <div class="header-right">
            <h1>Atelier Taher - ورقة الحضور</h1>
            <p>الحصة: ${day} ${label}</p>
          </div>
        </div>
        <hr />
        <table>
          <thead>
            <tr>
              <th style="text-align:right;">اسم التلميذ</th>
              <th style="text-align:center; width:90px;">حاضر (PRÉSENT)</th>
              <th style="text-align:center; width:90px;">غائب (ABSENT)</th>
              <th style="text-align:right; width:200px;">ملاحظات</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="count">المجموع: ${sessionStudents.length} تلميذ(ة)</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  // Helper to format date as DD/MM
  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  // Helper to format date for input (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getWeekDay = (baseDate, daysToAdd) => {
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + daysToAdd);
    return newDate;
  };

  const baseWeekDate = selectedWeekData ? new Date(selectedWeekData.startDate) : currentWeekDate;
  const mardiDate = baseWeekDate;
  const mercrediDate = getWeekDay(baseWeekDate, 1);
  const samediDate = getWeekDay(baseWeekDate, 4);
  const dimancheDate = getWeekDay(baseWeekDate, 5);

  const isPresent = (student, sessionKey) => {
    if (selectedWeekData) {
      const record = selectedWeekData.records.find(r => r.studentId === student._id);
      return record?.attendance?.some(a => a.session === sessionKey && a.present);
    }
    return student.attendance?.some(a => a.session === sessionKey && a.present);
  };

  const handleFinish = async (sessionKey) => {
    if (loadingSession) return;
    
    const isFinished = isSessionFinished(sessionKey);

    if (isFinished) {
      const confirmed = await customConfirm("Annuler la clôture", "Voulez-vous vraiment annuler la clôture de cette session ? Cela réduira le compteur du cycle pour les élèves de cette حصة.");
      if (!confirmed) return;
    }
    
    setLoadingSession(sessionKey);
    try {
      const success = await onFinishSession(sessionKey, isFinished);
      if (success) {
        if (isFinished) {
          // Revert: remove from finishedSessions
          setFinishedSessions(prev => {
            const updated = prev.filter(k => k !== sessionKey);
            localStorage.setItem('finishedSessions', JSON.stringify(updated));
            return updated;
          });
        } else {
          // Finish: add to finishedSessions
          setFinishedSessions(prev => {
            const updated = [...prev, sessionKey];
            localStorage.setItem('finishedSessions', JSON.stringify(updated));
            return updated;
          });
        }
      }
    } finally {
      setLoadingSession(null);
    }
  };

  const handleDatePickerChange = (e) => {
    onDateChange(new Date(e.target.value));
  };

  const handleNewWeekClick = async () => {
    const confirmed = await customConfirm("Nouvelle Semaine", "Voulez-vous enregistrer cette semaine et passer à la suivante ? Toutes les coches de présence seront réinitialisées.");
    if (confirmed) {
      const success = await onNewWeek(finishedSessions);
      if (success) {
        setFinishedSessions([]);
        localStorage.removeItem('finishedSessions');
        customAlert("Succès", "Nouvelle semaine démarrée !");
      }
    }
  };

  const isSessionFinished = (sessionKey) => {
    if (selectedWeekData) {
      return selectedWeekData.finishedSessions?.includes(sessionKey);
    }
    return finishedSessions.includes(sessionKey);
  };

  return (
    <div className="attendance-container">
      <div className="table-header-controls">
        <div className="table-title">
          <span className="dot"></span>
          <h2>{selectedWeekData ? `HISTORIQUE : SEMAINE DU ${formatDate(new Date(selectedWeekData.startDate))}` : (isArchivesView ? "LISTE DES ARCHIVÉS" : "FEUILLE DE PRÉSENCE HEBDOMADAIRE")}</h2>
        </div>
        <div className="table-actions">
          {selectedWeekData ? (
            <button className="btn-close-history" onClick={onCloseHistoryDetail}>Revenir à aujourd'hui</button>
          ) : (
            <>
              <button className="btn-history" onClick={() => setIsWeeksHistoryModalOpen(true)}>
                <History size={18} /> Historique Semaines
              </button>
              <div className="date-picker">
                <label>DATE DU MARDI:</label>
                <input type="date" value={formatDateForInput(currentWeekDate)} onChange={handleDatePickerChange} />
              </div>
              <button className="btn-new-week" onClick={handleNewWeekClick}>Nouvelle Semaine</button>

            </>
          )}
        </div>
      </div>

      <div className="filters-bar" style={{ display: 'flex', gap: '15px', marginBottom: '15px', padding: '0 10px' }}>
        <input 
          type="text" 
          placeholder="Rechercher par nom ou numéro de téléphone..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
        />
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', background: 'white' }}
        >
          <option value="default">Tri par défaut</option>
          <option value="alphabetical">De A à Z (Alphabétique)</option>
          <option value="newest">Les plus récents en premier</option>
          <option value="oldest">Les plus anciens en premier</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr className="main-header">
              <th rowSpan="2">INFORMATIONS ÉTUDIANT</th>
              <th className="th-mardi">{formatDate(mardiDate)}<br /> MARDI</th>

              <th className="th-mercredi" colSpan="2">{formatDate(mercrediDate)}<br /> MERCREDI</th>
              <th className="th-samedi" colSpan="2">{formatDate(samediDate)}<br /> SAMEDI</th>
              <th className="th-dimanche">{formatDate(dimancheDate)}<br /> DIMANCHE</th>
              <th rowSpan="2">CYCLE (SESSION)</th>
              <th rowSpan="2">RÈGLEMENT</th>
              <th rowSpan="2">ANNOTATIONS</th>
              <th rowSpan="2">ACTIONS</th>
            </tr>
            <tr className="sub-header">
              <th className="th-mardi">
                <div className="session-header">
                  <span className="session-label-btn" onClick={() => openSessionModal('mardi_matin', 'MATIN', 'MARDI')}>MATIN</span>
                  <span className="session-count-label">{getStudentsForSession('mardi_matin').length} élèves</span>
                  <button
                    className={`btn-term ${isSessionFinished('mardi_matin') ? 'finished' : ''} ${loadingSession ? 'working' : ''}`}
                    onClick={() => handleFinish('mardi_matin')}
                    disabled={selectedWeekData || !!loadingSession}
                  >
                    {loadingSession === 'mardi_matin' ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                    {isSessionFinished('mardi_matin') ? 'TERMINE' : 'TERMINER'}
                  </button>
                </div>
              </th>
              <th className="th-mercredi">
                <div className="session-header">
                  <span className="session-label-btn" onClick={() => openSessionModal('mercredi_matin', 'MATIN', 'MERCREDI')}>MATIN</span>
                  <span className="session-count-label">{getStudentsForSession('mercredi_matin').length} élèves</span>
                  <button
                    className={`btn-term ${isSessionFinished('mercredi_matin') ? 'finished' : ''} ${loadingSession ? 'working' : ''}`}
                    onClick={() => handleFinish('mercredi_matin')}
                    disabled={selectedWeekData || !!loadingSession}
                  >
                    {loadingSession === 'mercredi_matin' ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                    {isSessionFinished('mercredi_matin') ? 'TERMINE' : 'TERMINER'}
                  </button>
                </div>
              </th>
              <th className="th-mercredi">
                <div className="session-header">
                  <span className="session-label-btn" onClick={() => openSessionModal('mercredi_amidi', 'A.MIDI', 'MERCREDI')}>A.MIDI</span>
                  <span className="session-count-label">{getStudentsForSession('mercredi_amidi').length} élèves</span>
                  <button
                    className={`btn-term ${isSessionFinished('mercredi_amidi') ? 'finished' : ''} ${loadingSession ? 'working' : ''}`}
                    onClick={() => handleFinish('mercredi_amidi')}
                    disabled={selectedWeekData || !!loadingSession}
                  >
                    {loadingSession === 'mercredi_amidi' ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                    {isSessionFinished('mercredi_amidi') ? 'TERMINE' : 'TERMINER'}
                  </button>
                </div>
              </th>
              <th className="th-samedi">
                <div className="session-header">
                  <span className="session-label-btn" onClick={() => openSessionModal('samedi_matin', 'MATIN', 'SAMEDI')}>MATIN</span>
                  <span className="session-count-label">{getStudentsForSession('samedi_matin').length} élèves</span>
                  <button
                    className={`btn-term ${isSessionFinished('samedi_matin') ? 'finished' : ''} ${loadingSession ? 'working' : ''}`}
                    onClick={() => handleFinish('samedi_matin')}
                    disabled={selectedWeekData || !!loadingSession}
                  >
                    {loadingSession === 'samedi_matin' ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                    {isSessionFinished('samedi_matin') ? 'TERMINE' : 'TERMINER'}
                  </button>
                </div>
              </th>
              <th className="th-samedi">
                <div className="session-header">
                  <span className="session-label-btn" onClick={() => openSessionModal('samedi_amidi', 'A.MIDI', 'SAMEDI')}>A.MIDI</span>
                  <span className="session-count-label">{getStudentsForSession('samedi_amidi').length} élèves</span>
                  <button
                    className={`btn-term ${isSessionFinished('samedi_amidi') ? 'finished' : ''} ${loadingSession ? 'working' : ''}`}
                    onClick={() => handleFinish('samedi_amidi')}
                    disabled={selectedWeekData || !!loadingSession}
                  >
                    {loadingSession === 'samedi_amidi' ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                    {isSessionFinished('samedi_amidi') ? 'TERMINE' : 'TERMINER'}
                  </button>
                </div>
              </th>
              <th className="th-dimanche">
                <div className="session-header">
                  <span className="session-label-btn" onClick={() => openSessionModal('dimanche_unique', 'UNIQUE', 'DIMANCHE')}>UNIQUE</span>
                  <span className="session-count-label">{getStudentsForSession('dimanche_unique').length} élèves</span>
                  <button
                    className={`btn-term ${isSessionFinished('dimanche_unique') ? 'finished' : ''} ${loadingSession ? 'working' : ''}`}
                    onClick={() => handleFinish('dimanche_unique')}
                    disabled={selectedWeekData || !!loadingSession}
                  >
                    {loadingSession === 'dimanche_unique' ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                    {(isSessionFinished('dimanche_unique') || loadingSession === 'dimanche_unique') ? 'TERMINE' : 'TERMINER'}
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // --- Skeleton Loading State ---
              Array.from({ length: itemsPerPage }).map((_, idx) => (
                <tr key={`skeleton-${idx}`}>
                  <td>
                    <div className="student-info-cell" style={{ gap: '15px' }}>
                      <div className="skeleton skeleton-avatar"></div>
                      <div className="student-details" style={{ gap: '6px' }}>
                        <div className="skeleton skeleton-text" style={{ width: '120px' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '80px', height: '10px' }}></div>
                      </div>
                    </div>
                  </td>
                  {/* Attendance Checkboxes Skeleton */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <td key={`sk-check-${i}`}>
                      <div className="skeleton skeleton-box"></div>
                    </td>
                  ))}
                  {/* Cycle Skeleton */}
                  <td>
                    <div className="cycle-tracker">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={`sk-dot-${i}`} className="skeleton skeleton-dot"></div>
                      ))}
                    </div>
                  </td>
                  {/* Payment Skeleton */}
                  <td>
                    <div className="skeleton skeleton-select"></div>
                  </td>
                  {/* Annotations Skeleton */}
                  <td>
                    <div className="skeleton skeleton-input"></div>
                  </td>
                  {/* Actions Skeleton */}
                  <td>
                    <div className="action-btns">
                      <div className="skeleton skeleton-icon"></div>
                      <div className="skeleton skeleton-icon"></div>
                      <div className="skeleton skeleton-icon"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontWeight: 'bold' }}>
                  Aucun étudiant trouvé.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student) => (
                <tr 
                  key={student._id}
                  className={student.paymentStatus === 'Payer / تم الخلاص' ? 'row-payer' : ''}
                >
                <td>
                  <div className="student-info-cell">
                    <div className="student-avatar">
                      {student.name[0]}
                      {student.totalSessionsCount > 0 && student.totalSessionsCount % 8 === 0 && (
                        <div className="cycle-indicator" title="Cycle terminé !">!</div>
                      )}
                    </div>
                    <div className="student-details">
                      <strong>{student.name}</strong>
                      <span>{student.tarif} DT / {isSundayOnly(student.planning) ? '5' : '8'} Séances</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div
                    className={`attendance-check ${!student.planning?.mardi?.matin ? 'disabled' : ''} ${isPresent(student, 'mardi_matin') ? 'present' : ''} ${loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'mardi_matin' ? 'loading' : ''}`}
                    onClick={() => !isArchivesView && !selectedWeekData && !loadingCheck && student.planning?.mardi?.matin && handleCheckClick(student._id, 'mardi_matin')}
                  >
                    {loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'mardi_matin' && <Loader2 size={12} className="check-spinner" />}
                  </div>
                </td>
                <td>
                  <div
                    className={`attendance-check ${!student.planning?.mercredi?.matin ? 'disabled' : ''} ${isPresent(student, 'mercredi_matin') ? 'present' : ''} ${loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'mercredi_matin' ? 'loading' : ''}`}
                    onClick={() => !isArchivesView && !selectedWeekData && !loadingCheck && student.planning?.mercredi?.matin && handleCheckClick(student._id, 'mercredi_matin')}
                  >
                    {loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'mercredi_matin' && <Loader2 size={12} className="check-spinner" />}
                  </div>
                </td>
                <td>
                  <div
                    className={`attendance-check ${!student.planning?.mercredi?.amidi ? 'disabled' : ''} ${isPresent(student, 'mercredi_amidi') ? 'present' : ''} ${loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'mercredi_amidi' ? 'loading' : ''}`}
                    onClick={() => !isArchivesView && !selectedWeekData && !loadingCheck && student.planning?.mercredi?.amidi && handleCheckClick(student._id, 'mercredi_amidi')}
                  >
                    {loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'mercredi_amidi' && <Loader2 size={12} className="check-spinner" />}
                  </div>
                </td>
                <td>
                  <div
                    className={`attendance-check ${!student.planning?.samedi?.matin ? 'disabled' : ''} ${isPresent(student, 'samedi_matin') ? 'present' : ''} ${loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'samedi_matin' ? 'loading' : ''}`}
                    onClick={() => !isArchivesView && !selectedWeekData && !loadingCheck && student.planning?.samedi?.matin && handleCheckClick(student._id, 'samedi_matin')}
                  >
                    {loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'samedi_matin' && <Loader2 size={12} className="check-spinner" />}
                  </div>
                </td>
                <td>
                  <div
                    className={`attendance-check ${!student.planning?.samedi?.amidi ? 'disabled' : ''} ${isPresent(student, 'samedi_amidi') ? 'present' : ''} ${loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'samedi_amidi' ? 'loading' : ''}`}
                    onClick={() => !isArchivesView && !selectedWeekData && !loadingCheck && student.planning?.samedi?.amidi && handleCheckClick(student._id, 'samedi_amidi')}
                  >
                    {loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'samedi_amidi' && <Loader2 size={12} className="check-spinner" />}
                  </div>
                </td>
                <td>
                  <div
                    className={`attendance-check ${!student.planning?.dimanche?.unique ? 'disabled' : ''} ${isPresent(student, 'dimanche_unique') ? 'present' : ''} ${loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'dimanche_unique' ? 'loading' : ''}`}
                    onClick={() => !isArchivesView && !selectedWeekData && !loadingCheck && student.planning?.dimanche?.unique && handleCheckClick(student._id, 'dimanche_unique')}
                  >
                    {loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'dimanche_unique' && <Loader2 size={12} className="check-spinner" />}
                  </div>
                </td>
                <td>
                  <div className="cycle-tracker">
                    {(() => {
                      const maxS = isSundayOnly(student.planning) ? 5 : 8;
                      const totalSessions = student.totalSessionsCount || 0;
                      const sessionsInCurrentCycle = totalSessions % maxS || (totalSessions > 0 ? maxS : 0);
                      const dots = [];
                      for (let i = 0; i < maxS; i++) {
                        let statusClass = '';
                        if (i < sessionsInCurrentCycle) {
                          const history = student.simulatedHistory || student.cycleHistory || [];
                          const historyIndex = history.length - sessionsInCurrentCycle + i;
                          const session = history[historyIndex];
                          const effectiveType = student.historyOverrides?.[historyIndex] || session?.type;
                          if (effectiveType && effectiveType !== 'deleted') {
                            if (effectiveType === 'present') {
                              statusClass = 'attended';
                            } else if (effectiveType === 'compensated') {
                              statusClass = 'compensated';
                            } else {
                              statusClass = 'missed';
                            }
                          }
                        }
                        dots.push(<span key={i} className={`cycle-dot ${statusClass}`}></span>);
                      }
                      return dots;
                    })()}
                  </div>
                </td>
                <td>
                  <div className="payment-cell">
                    {(() => {
                      const totalCount = Number(student.totalSessionsCount || 0);
                      const paidCount = Number(student.paidSessionsCount || 0);
                      const tarif = student.tarif || 80;
                      const debtNodes = [];

                      let hasPartialDebt = false;
                      let actualRemainder = 0;

                      if (student.paymentStatus === "Payer Partiellement / دفع جزئي") {
                        const moneyReceivedTotal = student.totalMoneyPaid || 0;
                        actualRemainder = (moneyReceivedTotal % tarif === 0 && moneyReceivedTotal > 0) ? 0 : (tarif - (moneyReceivedTotal % tarif));
                        if (actualRemainder > 0 && actualRemainder < tarif) {
                          hasPartialDebt = true;
                        }
                      }

                      const hasUnpaidSessions = totalCount > paidCount;
                      const unpaidSessions = totalCount - paidCount;

                      if (hasPartialDebt && hasUnpaidSessions) {
                        debtNodes.push(
                          <div key="combined" className="payment-warning-container partial">
                            <span className="payment-warning">{unpaidSessions} séances sans paiement !</span>
                            <span className="debt-info">Reste: {actualRemainder} DT</span>
                          </div>
                        );
                      } else if (hasPartialDebt) {
                        debtNodes.push(
                          <div key="partial" className="payment-warning-container partial">
                            <span className="debt-info">Reste: {actualRemainder} DT</span>
                          </div>
                        );
                      } else if (hasUnpaidSessions) {
                        debtNodes.push(
                          <div key="sessions" className="payment-warning-container">
                            <span className="payment-warning">{unpaidSessions} séances sans paiement !</span>
                          </div>
                        );
                      }
                      return debtNodes.length > 0 ? <>{debtNodes}</> : null;
                    })()}
                    <select
                      value={student.paymentStatus}
                      onChange={(e) => onUpdatePayment(student._id, e.target.value)}
                    >
                      <option value="Non Payer / لم يدفع بعد">NON PAYER / لم يدفع بعد</option>
                      <option value="Payer / تم الخلاص">PAYER / تم الخلاص</option>
                      <option value="Payer Partiellement / دفع جزئي">PAYER PARTIELLEMENT / دفع جزئي</option>
                    </select>
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    className="annotation-input"
                    placeholder="Ajouter une note..."
                    defaultValue={student.notes}
                    onBlur={(e) => onUpdateNotes(student._id, e.target.value)}
                  />
                </td>
                <td>
                  <div className="action-btns">
                    <History size={18} className="icon-history" onClick={() => onViewHistory(student)} />
                    <Edit2 size={18} className="icon-edit" onClick={() => onEdit(student)} />
                    {isArchivesView ? (
                      <RotateCcw size={18} className="icon-unarchive" onClick={() => onUnarchive(student._id)} title="Désarchiver" />
                    ) : (
                      <Archive size={18} className="icon-archive" onClick={() => onArchive(student._id)} title="Archiver" />
                    )}
                    <Trash2 size={18} className="icon-delete" onClick={() => onDelete(student._id)} />
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="modern-pagination">
          <button className="page-nav-btn" onClick={handlePrevPage} disabled={currentPage === 1}>
            Précédent
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button 
                key={page} 
                className={`page-num-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button className="page-nav-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Suivant
          </button>
        </div>
      )}

      {isWeeksHistoryModalOpen && (
        <div className="modal-overlay">
          <div className="history-modal">
            <div className="modal-header">
              <h3>Historique des Semaines</h3>
              <button className="close-btn" onClick={() => setIsWeeksHistoryModalOpen(false)}>×</button>
            </div>
            <div className="weeks-grid">
              {weeksHistory.length === 0 ? (
                <p className="no-data">Aucune semaine enregistrée.</p>
              ) : (
                weeksHistory.map((week) => (
                  <div key={week._id} className="week-card" onClick={() => { onSelectHistoryWeek(week); setIsWeeksHistoryModalOpen(false); }}>
                    <div className="card-icon"><History size={24} /></div>
                    <div className="card-info">
                      <h4>Semaine du {formatDate(new Date(week.startDate))}</h4>
                      <span>{week.records.length} Étudiants</span>
                    </div>
                    <div className="card-arrow">→</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {sessionModal && (
        <div className="modal-overlay" onClick={() => setSessionModal(null)}>
          <div className="session-students-modal" onClick={e => e.stopPropagation()}>
            <div className="session-students-header">
              <div className="session-students-title">
                <div className="session-badge">{sessionModal.label}</div>
                <div>
                  <h3>{sessionModal.day} — {sessionModal.label}</h3>
                  <span className="session-students-sub">{getStudentsForSession(sessionModal.sessionKey).length} élève(s) programmé(s)</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn-print-appel"
                  onClick={() => printAttendanceSheet(sessionModal.sessionKey, sessionModal.label, sessionModal.day, getStudentsForSession(sessionModal.sessionKey))}
                >
                  🖨 Appel Rapide
                </button>
                <button className="close-btn" onClick={() => setSessionModal(null)}>×</button>
              </div>
            </div>
            <div className="session-students-list">
              {getStudentsForSession(sessionModal.sessionKey).length === 0 ? (
                <p className="no-data">Aucun élève programmé pour cette séance.</p>
              ) : (
                getStudentsForSession(sessionModal.sessionKey).map((s, i) => (
                  <div key={s._id} className="session-student-item">
                    <div className="session-student-num">{i + 1}</div>
                    <div className="session-student-avatar">{s.name[0]?.toUpperCase()}</div>
                    <div className="session-student-info">
                      <strong>{s.name}</strong>
                      <span>{s.phone}</span>
                    </div>

                    <div className="session-student-attendance-actions">
                      <button
                        className={`btn-attendance present ${isPresent(s, sessionModal.sessionKey) ? 'active' : ''}`}
                        onClick={() => !isArchivesView && !selectedWeekData && !loadingCheck && !isPresent(s, sessionModal.sessionKey) && handleCheckClick(s._id, sessionModal.sessionKey)}
                        disabled={loadingCheck?.studentId === s._id || isSessionFinished(sessionModal.sessionKey) || selectedWeekData}
                      >
                        <div className="icon-box"></div>
                        <span>Présent</span>
                      </button>
                      <button
                        className={`btn-attendance absent ${!isPresent(s, sessionModal.sessionKey) ? 'active' : ''}`}
                        onClick={() => !isArchivesView && !selectedWeekData && !loadingCheck && isPresent(s, sessionModal.sessionKey) && handleCheckClick(s._id, sessionModal.sessionKey)}
                        disabled={loadingCheck?.studentId === s._id || isSessionFinished(sessionModal.sessionKey) || selectedWeekData}
                      >
                        <div className="icon-box">{!isPresent(s, sessionModal.sessionKey) && <X size={14} strokeWidth={3} />}</div>
                        <span>Absent</span>
                      </button>
                    </div>

                    <div className={`session-student-status ${s.paymentStatus?.includes('Non') ? 'non-payer' : 'payer'}`}>
                      {s.paymentStatus?.includes('Non') ? 'NON PAYER' : 'PAYER'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;
