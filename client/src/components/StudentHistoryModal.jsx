import React, { useState } from 'react';
import { X, Calendar, Phone, Image as ImageIcon, Trash2 } from 'lucide-react';
import './StudentHistoryModal.css';

const StudentHistoryModal = ({ student, isOpen, onClose, onToggleCompensated, onToggleMonthlyPayment, onDeleteSession }) => {
  if (!isOpen) return null;

  const isEyaNaes = student.name?.toUpperCase() === "EYA NAES";
  const overrideEyaNaes = [
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // Mois 1
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // Mois 2
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // Mois 3
    [{ d: "25-juin", t: "present" }, { d: "28-juin", t: "present" }, { d: "01-juil.", t: "present" }, { d: "02-juil.", t: "present" }, { d: "08-juil.", t: "present" }, { d: "09-juil.", t: "present" }, { d: "15-juil.", t: "present" }, { d: "16-juil.", t: "present" }], // Mois 4
    [{ d: "22-juil.", t: "present" }, { d: "23-juil.", t: "present" }, { d: "29-juil.", t: "present" }, { d: "30-juil.", t: "present" }, { d: "05-août", t: "absent" }, { d: "06-août", t: "absent" }, { d: "12-août", t: "absent" }, { d: "13-août", t: "absent" }], // Mois 5
    [{ d: "19-août", t: "absent" }, { d: "20-août", t: "absent" }, { d: "26-août", t: "absent" }, { d: "27-août", t: "absent" }, { d: "02-sept.", t: "absent" }, { d: "03-sept.", t: "absent" }, { d: "09-sept.", t: "present" }, { d: "10-sept.", t: "present" }], // Mois 6
    [{ d: "16-sept.", t: "present" }, { d: "17-sept.", t: "present" }, { d: "23-sept.", t: "present" }, { d: "24-sept.", t: "present" }, { d: "30-sept.", t: "present" }, { d: "01-oct.", t: "absent" }, { d: "07-oct.", t: "absent" }, { d: "08-oct.", t: "present" }], // Mois 7
    [{ d: "22-nov.", t: "present" }, { d: "22-nov.", t: "present" }, { d: "29-nov.", t: "present" }, { d: "29-nov.", t: "present" }, { d: "06-déc.", t: "absent" }, { d: "06-déc.", t: "absent" }, { d: "13-déc.", t: "present" }, { d: "13-déc.", t: "present" }], // Mois 8
    [{ d: "20-déc.", t: "present" }, { d: "20-déc.", t: "present" }, { d: "27-déc.", t: "present" }, { d: "27-déc.", t: "present" }, { d: "03-janv.", t: "present" }, { d: "03-janv.", t: "present" }, { d: "10-janv.", t: "present" }, { d: "10-janv.", t: "present" }], // Mois 9
    [{ d: "17-janv.", t: "present" }, { d: "17-janv.", t: "present" }, { d: "31-janv.", t: "present" }, { d: "31-janv.", t: "present" }, { d: "07-févr.", t: "present" }, { d: "07-févr.", t: "present" }, { d: "14-févr.", t: "present" }, { d: "14-févr.", t: "present" }], // Mois 10
    [{ d: "21-févr.", t: "present" }, { d: "28-févr.", t: "present" }, { d: "28-févr.", t: "present" }, { d: "07-mars", t: "present" }, { d: "07-mars", t: "present" }, { d: "14-mars", t: "present" }, { d: "14-mars", t: "present" }, { d: "28-mars", t: "absent" }], // Mois 11
    [{ d: "28-mars", t: "absent" }, { d: "04-avr.", t: "absent" }, { d: "04-avr.", t: "absent" }, null, null, null, null, null] // Mois 12
  ];

  const isNesrineNafati = student.name?.toUpperCase() === "NESRINE NAFATI";
  const overrideNesrineNafati = [
    [{ d: "22-juin", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 1
    [{ d: "03-août", t: "present" }, { d: "10-août", t: "present" }, { d: "17-août", t: "absent" }, { d: "24-août", t: "present" }, { d: "31-août", t: "present" }], // 2
    [{ d: "07-sept.", t: "present" }, { d: "14-sept.", t: "present" }, { d: "21-sept.", t: "present" }, { d: "28-sept.", t: "present" }, { d: "05-oct.", t: "present" }], // 3
    [{ d: "12-oct.", t: "present" }, { d: "26-oct.", t: "present" }, { d: "02-nov.", t: "present" }, { d: "09-nov.", t: "present" }, { d: "16-nov.", t: "present" }], // 4
    [{ d: "23-nov.", t: "present" }, { d: "30-nov.", t: "present" }, { d: "07-déc.", t: "present" }, { d: "14-déc.", t: "present" }, { d: "21-déc.", t: "present" }], // 5
    [{ d: "04-janv.", t: "present" }, { d: "11-janv.", t: "present" }, { d: "18-janv.", t: "present" }, { d: "25-janv.", t: "present" }, { d: "01-févr.", t: "present" }], // 6
    [{ d: "08-févr.", t: "present" }, { d: "15-févr.", t: "present" }, { d: "01-mars", t: "present" }, { d: "15-mars", t: "present" }, { d: "--", t: "present" }], // 7
    [{ d: "05-avr.", t: "present" }] // 8
  ];

  const isMalekKemel = student.name?.toUpperCase() === "MALEK KEMEL";
  const overrideMalekKemel = [
    [{ d: "01-févr.", t: "present" }, { d: "08-févr.", t: "present" }, { d: "15-févr.", t: "present" }, { d: "22-févr.", t: "absent" }, { d: "01-mars", t: "present" }] // 1
  ];

  const isYosraBenAli = student.name?.toUpperCase() === "YOSRA BEN ALI";
  const overrideYosraBenAli = [
    [{ d: "01-févr.", t: "present" }, { d: "08-févr.", t: "present" }, { d: "15-févr.", t: "present" }, { d: "22-févr.", t: "present" }, { d: "01-mars", t: "present" }], // 1
    [{ d: "08-mars", t: "present" }, { d: "15-mars", t: "present" }] // 2
  ];

  const isImenSafi = student.name?.toUpperCase() === "IMEN SAFI";
  const overrideImenSafi = [
    [{ d: "01-févr.", t: "present" }, { d: "08-févr.", t: "present" }, { d: "15-févr.", t: "present" }, { d: "22-févr.", t: "present" }, { d: "01-mars", t: "present" }], // 1
    [{ d: "05-avr.", t: "present" }] // 2
  ];

  const isEmnaLwetti = student.name?.toUpperCase() === "EMNA LWETTI";
  const overrideEmnaLouetti = [
    [{ d: "11-janv.", t: "present" }, { d: "18-janv.", t: "present" }, { d: "25-janv.", t: "present" }, { d: "01-févr.", t: "present" }, { d: "08-févr.", t: "present" }], // 1
    [{ d: "15-févr.", t: "present" }, { d: "22-févr.", t: "present" }, { d: "15-mars", t: "absent" }] // 2
  ];

  const isHanaBrlghith = student.name?.toUpperCase() === "HANA BRLGHITH";
  const overrideHanaBelghith = [
    [{ d: "25-janv.", t: "present" }, { d: "01-févr.", t: "present" }, { d: "08-févr.", t: "present" }, { d: "15-févr.", t: "present" }, { d: "22-févr.", t: "present" }], // 1
    [{ d: "01-mars", t: "absent" }, { d: "08-mars", t: "absent" }, { d: "15-mars", t: "absent" }] // 2
  ];

  const isNesrineDradra = student.name?.toUpperCase() === "NESRINE DRADRA";
  const overrideNesrineDradra = [
    [{ d: "01-févr.", t: "present" }, { d: "08-févr.", t: "present" }, { d: "15-févr.", t: "present" }, { d: "22-févr.", t: "absent" }, { d: "01-mars", t: "present" }], // 1
    [{ d: "08-mars", t: "present" }, { d: "15-mars", t: "absent" }] // 2
  ];

  const isOmaymaHmidet = student.name?.toUpperCase() === "OMAYMA HMIDET";
  const overrideOmaymaHmidet = [
    [{ d: "07-déc.", t: "present" }, { d: "14-déc.", t: "present" }, { d: "21-déc.", t: "present" }, { d: "28-déc.", t: "present" }, { d: "04-janv.", t: "present" }], // 1
    [{ d: "11-janv.", t: "present" }, { d: "18-janv.", t: "present" }, { d: "25-janv.", t: "present" }, { d: "08-févr.", t: "present" }, { d: "15-févr.", t: "present" }], // 2
    [{ d: "22-févr.", t: "present" }, { d: "01-mars", t: "absent" }, { d: "08-mars", t: "present" }, { d: "15-mars", t: "absent" }] // 3
  ];

  const isRawaaBouzidi = student.name?.toUpperCase() === "RAWAA BOUZIDI";
  const overrideRawaaBouzidi = [
    [{ d: "04-janv.", t: "present" }, { d: "11-janv.", t: "present" }, { d: "18-janv.", t: "present" }, { d: "25-janv.", t: "present" }, { d: "01-févr.", t: "present" }], // 1
    [{ d: "08-févr.", t: "present" }, { d: "15-févr.", t: "present" }, { d: "22-févr.", t: "present" }, { d: "01-mars", t: "absent" }, { d: "08-mars", t: "present" }], // 2
    [{ d: "15-mars", t: "present" }] // 3
  ];

  const isEmnaGhodhben = student.name?.toUpperCase() === "EMNA GHODHBEN";
  const overrideEmnaGhodhben = [
    [{ d: "21-déc.", t: "present" }, { d: "28-déc.", t: "present" }, { d: "31-déc.", t: "present" }, { d: "11-janv.", t: "present" }, { d: "18-janv.", t: "present" }], // 1
    [{ d: "25-janv.", t: "present" }, { d: "01-févr.", t: "present" }, { d: "04-févr.", t: "present" }, { d: "08-févr.", t: "present" }, { d: "15-févr.", t: "present" }], // 2
    [{ d: "22-févr.", t: "present" }, { d: "01-mars", t: "present" }, { d: "08-mars", t: "present" }, { d: "15-mars", t: "present" }] // 3
  ];

  const isIbtissemBdlewi = student.name?.toUpperCase() === "IBTISSEM BDLEWI";
  const overrideIbtissemBdlewi = [
    [{ d: "09-nov.", t: "present" }, { d: "15-nov.", t: "present" }, { d: "23-nov.", t: "present" }, { d: "30-nov.", t: "present" }, { d: "07-دéc.", t: "present" }], // 1
    [{ d: "14-دéc.", t: "absent" }, { d: "21-دéc.", t: "present" }, { d: "28-دéc.", t: "absent" }, { d: "04-janv.", t: "absent" }, { d: "11-janv.", t: "absent" }] // 2
  ];

  const isMalekMkawar = student.name?.toUpperCase() === "MALEK MKAWAR";
  const overrideMalekMkawar = [
    [{ d: "05-oct.", t: "present" }, { d: "19-oct.", t: "present" }, { d: "26-oct.", t: "present" }, { d: "02-nov.", t: "present" }, { d: "09-nov.", t: "present" }], // 1
    [{ d: "16-nov.", t: "present" }, { d: "23-nov.", t: "present" }, { d: "30-nov.", t: "present" }, { d: "07-déc.", t: "present" }, { d: "14-déc.", t: "present" }], // 2
    [{ d: "21-déc.", t: "present" }, { d: "28-déc.", t: "present" }, { d: "04-janv.", t: "absent" }, { d: "11-janv.", t: "present" }, { d: "18-janv.", t: "present" }], // 3
    [{ d: "25-janv.", t: "present" }, { d: "01-févr.", t: "present" }, { d: "08-févr.", t: "present" }, { d: "15-févr.", t: "present" }, { d: "22-févr.", t: "present" }], // 4
    [{ d: "01-mars", t: "present" }, { d: "08-mars", t: "present" }, { d: "15-mars", t: "present" }] // 5
  ];

  const isSiwarKaabechi = student.name?.toUpperCase() === "SIWAR KAABECHI";
  const overrideSiwarKaabechi = [
    [{ d: "12-oct.", t: "present" }, { d: "19-oct.", t: "present" }, { d: "26-oct.", t: "present" }, { d: "02-nov.", t: "present" }, { d: "09-nov.", t: "present" }], // 1
    [{ d: "16-nov.", t: "present" }, { d: "23-nov.", t: "present" }, { d: "30-nov.", t: "present" }, { d: "07-déc.", t: "present" }, { d: "14-déc.", t: "absent" }], // 2
    [{ d: "21-déc.", t: "present" }, { d: "28-déc.", t: "absent" }, { d: "04-janv.", t: "absent" }, { d: "11-janv.", t: "absent" }, { d: "18-janv.", t: "absent" }], // 3
    [{ d: "25-janv.", t: "absent" }] // 4
  ];

  const isBassmaHamdewi = student.name?.toUpperCase() === "BASSMA HAMDEWI";
  const overrideBassmaHamdewi = [
    [{ d: "12-oct.", t: "present" }, { d: "19-oct.", t: "present" }, { d: "26-oct.", t: "present" }, { d: "02-nov.", t: "present" }, { d: "09-nov.", t: "present" }], // 1
    [{ d: "16-nov.", t: "present" }, { d: "23-nov.", t: "present" }, { d: "30-nov.", t: "present" }, { d: "07-déc.", t: "present" }, { d: "14-déc.", t: "present" }], // 2
    [{ d: "21-déc.", t: "present" }, { d: "28-déc.", t: "present" }, { d: "04-janv.", t: "present" }, { d: "11-janv.", t: "present" }, { d: "18-janv.", t: "present" }], // 3
    [{ d: "25-janv.", t: "present" }, { d: "01-févr.", t: "present" }, { d: "08-févr.", t: "present" }, { d: "15-févr.", t: "present" }, { d: "22-févr.", t: "present" }], // 4
    [{ d: "01-mars", t: "absent" }, { d: "08-mars", t: "present" }, { d: "15-mars", t: "present" }] // 5
  ];

  const isSalwaHani = student.name?.toUpperCase() === "SALWA HANI";
  const overrideSalwaHani = [
    [{ d: "19-oct.", t: "present" }, { d: "26-oct.", t: "present" }, { d: "02-nov.", t: "absent" }, { d: "09-nov.", t: "present" }, { d: "16-nov.", t: "present" }], // 1
    [{ d: "23-nov.", t: "present" }, { d: "30-nov.", t: "present" }, { d: "10-déc.", t: "present" }, { d: "14-déc.", t: "absent" }, { d: "21-déc.", t: "absent" }], // 2
    [{ d: "28-déc.", t: "absent" }, { d: "04-janv.", t: "absent" }] // 3
  ];

  const isMaissaBenNaser = student.name?.toUpperCase() === "MAISSA BEN NASER";
  const overrideMaissaBenNaser = [
    [{ d: "07-sept.", t: "present" }, { d: "14-sept.", t: "present" }, { d: "21-sept.", t: "present" }, { d: "28-sept.", t: "present" }, { d: "05-oct.", t: "present" }], // 1
    [{ d: "12-oct.", t: "absent" }, { d: "19-oct.", t: "present" }, { d: "26-oct.", t: "absent" }, { d: "02-nov.", t: "present" }, { d: "09-nov.", t: "present" }], // 2
    [{ d: "16-nov.", t: "present" }, { d: "23-nov.", t: "present" }, { d: "30-nov.", t: "present" }, { d: "07-déc.", t: "present" }, { d: "14-déc.", t: "present" }], // 3
    [{ d: "21-déc.", t: "present" }, { d: "28-déc.", t: "absent" }, { d: "04-janv.", t: "absent" }, { d: "11-janv.", t: "absent" }] // 4
  ];

  const isTakwaHarchi = student.name?.toUpperCase() === "TAKWA HARCHI";
  const overrideTakwaHarchi = [
    [{ d: "05-oct.", t: "present" }, { d: "12-oct.", t: "present" }, { d: "19-oct.", t: "present" }, { d: "26-oct.", t: "present" }, { d: "02-nov.", t: "absent" }], // 1
    [{ d: "09-nov.", t: "present" }, { d: "16-nov.", t: "present" }, { d: "23-nov.", t: "present" }, { d: "30-nov.", t: "present" }, { d: "07-déc.", t: "present" }], // 2
    [{ d: "14-déc.", t: "absent" }, { d: "21-déc.", t: "absent" }] // 3
  ];

  const isMariemTrabelsi = student.name?.toUpperCase() === "MARIEM TRABELSI";
  const overrideMariemTrabelsi = [
    [{ d: "06-juil.", t: "present" }, { d: "13-juil.", t: "present" }, { d: "20-juil.", t: "present" }, { d: "27-juil.", t: "present" }, { d: "03-août", t: "present" }], // 1
    [{ d: "10-août", t: "present" }, { d: "17-août", t: "present" }, { d: "24-août", t: "present" }, { d: "31-août", t: "present" }], // 2
    [{ d: "14-août", t: "present" }, { d: "21-sept.", t: "present" }, { d: "28-sept.", t: "present" }, { d: "05-oct.", t: "present" }, { d: "12-oct.", t: "present" }], // 3
    [{ d: "19-oct.", t: "present" }, { d: "26-oct.", t: "present" }, { d: "02-nov.", t: "present" }, { d: "09-nov.", t: "present" }, { d: "16-nov.", t: "present" }], // 4
    [{ d: "23-nov.", t: "present" }, { d: "30-nov.", t: "present" }, { d: "07-déc.", t: "present" }, { d: "14-déc.", t: "present" }, { d: "21-déc.", t: "present" }], // 5
    [{ d: "28-déc.", t: "present" }, { d: "04-janv.", t: "present" }, { d: "11-janv.", t: "present" }, { d: "18-janv.", t: "present" }, { d: "25-janv.", t: "present" }], // 6
    [{ d: "01-mars", t: "present" }, { d: "08-mars", t: "absent" }, { d: "15-mars", t: "absent" }] // 7
  ];

  const isRihabBouali = student.name?.toUpperCase() === "RIHAB BOUALI";
  const overrideRihabBouali = [
    [{ d: "23-févr.", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 1
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 2
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 3
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 4
    [{ d: "27-juil.", t: "present" }, { d: "03-août", t: "present" }, { d: "10-août", t: "present" }, { d: "17-août", t: "absent" }, { d: "24-août", t: "present" }], // 5
    [{ d: "31-août", t: "present" }, { d: "07-sept.", t: "present" }, { d: "14-sept.", t: "present" }, { d: "21-sept.", t: "present" }, { d: "28-sept.", t: "present" }], // 6
    [{ d: "05-oct.", t: "present" }, { d: "12-oct.", t: "present" }, { d: "19-oct.", t: "present" }, { d: "26-oct.", t: "absent" }, { d: "02-nov.", t: "present" }], // 7
    [{ d: "09-nov.", t: "present" }, { d: "16-nov.", t: "present" }, { d: "23-nov.", t: "present" }, { d: "30-nov.", t: "present" }, { d: "07-déc.", t: "present" }], // 8
    [{ d: "14-déc.", t: "present" }, { d: "21-déc.", t: "present" }, { d: "28-déc.", t: "present" }, { d: "04-janv.", t: "present" }, { d: "11-janv.", t: "present" }], // 9
    [{ d: "18-janv.", t: "present" }, { d: "25-janv.", t: "present" }, { d: "01-févr.", t: "present" }, { d: "08-févr.", t: "present" }, { d: "15-févr.", t: "absent" }], // 10
    [{ d: "22-févr.", t: "present" }, { d: "01-mars", t: "present" }, { d: "08-mars", t: "present" }, { d: "15-mars", t: "present" }] // 11
  ];

  const isAichaHerchi = student.name?.toUpperCase() === "AICHA HERCHI";
  const overrideAichaHerchi = [
    [{ d: "16-févr.", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 1
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 2
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 3
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 4
    [{ d: "06-juil.", t: "present" }, { d: "13-juil.", t: "present" }, { d: "20-juil.", t: "present" }, { d: "27-juil.", t: "present" }, { d: "03-août", t: "present" }], // 5
    [{ d: "10-août", t: "present" }, { d: "17-août", t: "present" }, { d: "24-août", t: "present" }, { d: "31-août", t: "present" }, { d: "07-sept.", t: "absent" }], // 6
    [{ d: "14-sept.", t: "absent" }, { d: "21-sept.", t: "present" }, { d: "28-sept.", t: "present" }, { d: "05-oct.", t: "present" }, { d: "12-oct.", t: "present" }], // 7
    [{ d: "19-oct.", t: "present" }, { d: "26-oct.", t: "present" }, { d: "02-nov.", t: "present" }, { d: "09-nov.", t: "present" }, { d: "16-nov.", t: "present" }], // 8
    [{ d: "23-nov.", t: "present" }, { d: "30-nov.", t: "present" }, { d: "07-déc.", t: "present" }, { d: "14-déc.", t: "present" }, { d: "24-déc.", t: "present" }], // 9
    [{ d: "28-déc.", t: "absent" }, { d: "04-janv.", t: "absent" }, { d: "11-janv.", t: "present" }, { d: "18-janv.", t: "present" }, { d: "25-janv.", t: "absent" }], // 10
    [{ d: "01-févr.", t: "present" }, { d: "08-févr.", t: "present" }, { d: "15-févr.", t: "present" }, { d: "22-févr.", t: "present" }, { d: "01-mars", t: "present" }], // 11
    [{ d: "08-mars", t: "present" }, { d: "15-mars", t: "present" }] // 12
  ];

  const isManelYousfi = student.name?.toUpperCase() === "MANEL YOUSFI";
  const overrideManelYousfi = [
    [{ d: "12-janv.", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 1
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 2
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 3
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 4
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 5
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 6
    [{ d: "17-août", t: "absent" }, { d: "24-août", t: "present" }, { d: "31-août", t: "present" }, { d: "07-sept.", t: "present" }, { d: "14-sept.", t: "present" }], // 7
    [{ d: "21-sept.", t: "present" }, { d: "28-sept.", t: "present" }, { d: "05-oct.", t: "present" }, { d: "12-oct.", t: "present" }, { d: "19-oct.", t: "present" }], // 8
    [{ d: "26-oct.", t: "present" }, { d: "02-nov.", t: "present" }, { d: "09-nov.", t: "present" }, { d: "16-nov.", t: "present" }, { d: "23-nov.", t: "present" }], // 9
    [{ d: "30-nov.", t: "present" }, { d: "07-déc.", t: "present" }, { d: "14-déc.", t: "absent" }, { d: "21-déc.", t: "present" }, { d: "28-déc.", t: "absent" }], // 10
    [{ d: "04-janv.", t: "present" }, { d: "11-janv.", t: "absent" }, { d: "18-janv.", t: "absent" }, { d: "25-janv.", t: "present" }], // 11
    [{ d: "01-févr.", t: "present" }, { d: "08-févr.", t: "present" }, { d: "15-févr.", t: "present" }, { d: "22-févr.", t: "present" }, { d: "01-mars", t: "present" }] // 12
  ];

  const isRimHidri = student.name?.toUpperCase() === "RIM HIDRI";
  const overrideRimHidri = [
    [{ d: "19-janv.", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 1
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 2
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 3
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 4
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 5
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 6
    [{ d: "17-août", t: "present" }, { d: "24-août", t: "present" }, { d: "31-août", t: "present" }, { d: "07-sept.", t: "present" }, { d: "14-sept.", t: "present" }], // 7
    [{ d: "21-sept.", t: "present" }, { d: "28-sept.", t: "present" }, { d: "05-oct.", t: "present" }, { d: "12-oct.", t: "absent" }, { d: "19-oct.", t: "present" }], // 8
    [{ d: "26-oct.", t: "absent" }, { d: "02-nov.", t: "present" }, { d: "09-nov.", t: "present" }, { d: "23-nov.", t: "present" }, { d: "30-nov.", t: "present" }], // 9
    [{ d: "07-déc.", t: "present" }, { d: "14-déc.", t: "present" }, { d: "21-déc.", t: "present" }, { d: "28-déc.", t: "present" }, { d: "04-janv.", t: "present" }], // 10
    [{ d: "11-janv.", t: "present" }, { d: "18-janv.", t: "present" }, { d: "25-janv.", t: "present" }, { d: "01-févr.", t: "present" }, { d: "08-févr.", t: "present" }], // 11
    [{ d: "15-févr.", t: "absent" }, { d: "22-févr.", t: "present" }, { d: "01-mars", t: "present" }, { d: "08-mars", t: "present" }, { d: "15-mars", t: "present" }] // 12
  ];

  const isWidedAhmer = student.name?.toUpperCase() === "WIDED AHMER";
  const overrideWidedAhmer = [
    [{ d: "05-janv.", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 1
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 2
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 3
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 4
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 5
    [{ d: "29-juين", t: "present" }, { d: "06-jويل.", t: "present" }, { d: "13-jويل.", t: "present" }, { d: "20-jويل.", t: "present" }, { d: "27-jويل.", t: "present" }], // 6
    [{ d: "03-أوت", t: "present" }, { d: "10-أوت", t: "present" }, { d: "17-أوت", t: "present" }, { d: "24-أوت", t: "present" }, { d: "31-أوت", t: "present" }], // 7
    [{ d: "07-سpt.", t: "absent" }, { d: "14-سpt.", t: "present" }, { d: "21-سpt.", t: "present" }, { d: "28-سpt.", t: "present" }, { d: "05-أوct.", t: "present" }], // 8
    [{ d: "12-أوct.", t: "present" }, { d: "19-أوct.", t: "absent" }, { d: "26-أوct.", t: "present" }, { d: "02-نov.", t: "absent" }, { d: "09-نov.", t: "present" }], // 9
    [{ d: "16-نov.", t: "present" }, { d: "09-نov.", t: "present" }, { d: "16-نov.", t: "present" }, { d: "23-نov.", t: "present" }, { d: "30-نov.", t: "present" }], // 10
    [{ d: "07-ديc.", t: "present" }, { d: "14-ديc.", t: "present" }, { d: "21-ديc.", t: "present" }, { d: "28-ديc.", t: "present" }, { d: "04-jانv.", t: "absent" }], // 11
    [{ d: "11-jانv.", t: "present" }, { d: "18-jانv.", t: "present" }, { d: "25-jانv.", t: "present" }, { d: "01-févr.", t: "present" }, { d: "08-févr.", t: "present" }], // 12
    [{ d: "15-févr.", t: "present" }, { d: "22-févr.", t: "present" }, { d: "01-mars", t: "present" }, { d: "08-mars", t: "present" }, { d: "15-mars", t: "present" }], // 13
    [{ d: "29-mars", t: "absent" }, { d: "05-avr.", t: "present" }] // 14
  ];

  const isSihemSalah = student.name?.toUpperCase() === "SIHEM SALAH";
  const overrideSihemSalah = [
    [{d:"01-nov.", t:"present"}],
    [{d:"10-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"20-déc.", t:"absent"}, {d:"27-déc.", t:"present"}, {d:"03-janv.", t:"present"}, {d:"03-janv.", t:"present"}],
    [{d:"10-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"24-janv.", t:"absent"}, {d:"24-janv.", t:"absent"}, {d:"31-janv.", t:"present"}, {d:"31-janv.", t:"present"}],
    [{d:"07-mars", t:"present"}, {d:"07-mars", t:"present"}, {d:"14-mars", t:"present"}, {d:"14-mars", t:"present"}, {d:"28-mars", t:"present"}, {d:"28-mars", t:"present"}, {d:"04-avr.", t:"absent"}, {d:"04-avr.", t:"absent"}]
  ];

  const isYosraBenTaher = student.name?.toUpperCase() === "YOSRA BEN TAHER";
  const overrideYosraBenTaher = [
    [{ d: "22-سpt.", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 1
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 2..4
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 5..9
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "03-أوت", t: "present" }, { d: "10-أوت", t: "present" }, { d: "17-أوت", t: "present" }, { d: "24-أوت", t: "present" }, { d: "31-أوت", t: "present" }], // 10
    [{ d: "07-سpt.", t: "present" }, { d: "14-سpt.", t: "present" }, { d: "21-سpt.", t: "absent" }, { d: "28-سpt.", t: "present" }, { d: "05-أوct.", t: "absent" }], // 11
    [{ d: "12-أوct.", t: "present" }, { d: "19-أوct.", t: "present" }, { d: "26-أوct.", t: "present" }, { d: "02-نov.", t: "present" }], // 12
    [{ d: "16-نov.", t: "present" }, { d: "09-نov.", t: "present" }, { d: "16-نov.", t: "present" }, { d: "23-نov.", t: "present" }, { d: "30-نov.", t: "present" }], // 13
    [{ d: "07-ديc.", t: "present" }, { d: "14-ديc.", t: "present" }, { d: "21-ديc.", t: "present" }, { d: "28-ديc.", t: "present" }, { d: "04-jانv.", t: "present" }], // 14
    [{ d: "11-jانv.", t: "present" }, { d: "18-jانv.", t: "present" }, { d: "25-jانv.", t: "present" }, { d: "01-févr.", t: "absent" }, { d: "08-févr.", t: "present" }], // 15
    [{ d: "08-févr.", t: "present" }, { d: "15-févr.", t: "present" }, { d: "22-févr.", t: "present" }, { d: "01-mars", t: "absent" }] // 16
  ];

  const isRihabBouhlel = student.name?.toUpperCase() === "RIHAB BOUHLEL";
  const overrideRihabBouhlel = [
    [{ d: "01-سpt.", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 1
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 2..4
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 5..9
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "06-jويل.", t: "present" }, { d: "13-jويل.", t: "present" }, { d: "20-jويل.", t: "present" }, { d: "27-jويل.", t: "present" }, { d: "03-أوت", t: "present" }], // 10
    [{ d: "10-أوت", t: "present" }, { d: "17-أوت", t: "absent" }, { d: "24-أوت", t: "present" }, { d: "31-أوت", t: "present" }, { d: "07-سpt.", t: "present" }], // 11
    [{ d: "21-سpt.", t: "present" }, { d: "28-سpt.", t: "present" }, { d: "05-أوct.", t: "present" }, { d: "12-أوct.", t: "absent" }, { d: "19-أوct.", t: "present" }], // 12
    [{ d: "26-أوct.", t: "present" }, { d: "02-نov.", t: "present" }, { d: "09-نov.", t: "present" }, { d: "16-نov.", t: "present" }, { d: "23-نov.", t: "present" }], // 13
    [{ d: "30-نov.", t: "present" }, { d: "07-ديc.", t: "absent" }, { d: "14-ديc.", t: "present" }, { d: "21-ديc.", t: "present" }, { d: "28-ديc.", t: "present" }], // 14
    [{ d: "04-jانv.", t: "present" }, { d: "11-jانv.", t: "present" }, { d: "18-jانv.", t: "present" }, { d: "25-jانv.", t: "present" }, { d: "01-févr.", t: "present" }], // 15
    [{ d: "08-févr.", t: "present" }, { d: "15-févr.", t: "present" }, { d: "22-févr.", t: "present" }, { d: "01-mars", t: "absent" }, { d: "08-mars", t: "present" }], // 16
    [{ d: "15-mars", t: "present" }] // 17
  ];

  const isMarwaHentati = student.name?.toUpperCase() === "MARWA HENTATI";
  const overrideMarwaHentati = [
    [{ d: "20-أوct.", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 1
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 2..4
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 5..8
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "20-jويل.", t: "present" }, { d: "27-jويل.", t: "present" }, { d: "03-أوت", t: "present" }, { d: "10-أوت", t: "present" }, { d: "17-أوت", t: "present" }], // 9
    [{ d: "24-أوت", t: "present" }, { d: "31-أوت", t: "present" }, { d: "07-سpt.", t: "present" }, { d: "14-سpt.", t: "present" }, { d: "21-سpt.", t: "present" }], // 10
    [{ d: "28-سpt.", t: "present" }, { d: "05-أوct.", t: "present" }, { d: "12-أوct.", t: "present" }, { d: "19-أوct.", t: "present" }, { d: "26-أوct.", t: "present" }], // 11
    [{ d: "02-نov.", t: "absent" }, { d: "09-نov.", t: "present" }, { d: "16-نov.", t: "present" }, { d: "23-نov.", t: "present" }, { d: "30-نov.", t: "present" }], // 12
    [{ d: "07-ديc.", t: "absent" }, { d: "14-ديc.", t: "present" }, { d: "21-ديc.", t: "present" }, { d: "28-ديc.", t: "present" }, { d: "04-jانv.", t: "absent" }], // 13
    [{ d: "11-jانv.", t: "present" }, { d: "18-jانv.", t: "present" }, { d: "25-jانv.", t: "present" }, { d: "01-févr.", t: "present" }, { d: "08-févr.", t: "present" }], // 14
    [{ d: "15-févr.", t: "present" }, { d: "22-févr.", t: "present" }, { d: "01-mars", t: "present" }, { d: "08-mars", t: "present" }, { d: "15-mars", t: "absent" }] // 15
  ];

  const isArbiaHarathi = student.name?.toUpperCase() === "ARBIA HARATHI";
  const overrideArbiaHarathi = [
    [{ d: "27-أوct.", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 1
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 2..4
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }], // 5..9
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }, { d: "--", t: "present" }],
    [{ d: "03-أوت", t: "present" }, { d: "10-أوت", t: "present" }, { d: "17-أوت", t: "present" }, { d: "24-أوت", t: "present" }, { d: "31-أوت", t: "present" }], // 10
    [{ d: "18-jانv.", t: "present" }, { d: "25-jانv.", t: "present" }, { d: "01-févr.", t: "present" }, { d: "08-févr.", t: "present" }, { d: "15-févr.", t: "present" }], // 11
    [{ d: "22-févr.", t: "present" }, { d: "01-mars", t: "present" }, { d: "08-mars", t: "present" }, { d: "15-mars", t: "present" }] // 12
  ];

  const overrideArijMnasri = [
    [{ d: "08-avr.", t: "present" }] // 1
  ];

  const overrideHanenBelaayeb = [
    [{ d: "31-mars", t: "present" }, { d: "01-avr.", t: "present" }, { d: "07-avr.", t: "present" }, { d: "08-avr.", t: "present" }]
  ];
  const overrideChahinezMejdoub = [
    [{ d: "08-janv.", t: "present" }]
  ];
  const overrideDhekraGlissi = [
    [{ d: "04-mars", t: "present" }, { d: "11-mars", t: "present" }, { d: "11-mars", t: "present" }, { d: "25-mars", t: "present" }, { d: "25-mars", t: "present" }, { d: "01-avr.", t: "present" }, { d: "08-avr.", t: "present" }, { d: "08-avr.", t: "present" }]
  ];
  const overrideYassmineGuidara = [
    [{ d: "24-janv.", t: "present" }, { d: "24-janv.", t: "present" }, { d: "31-janv.", t: "present" }, { d: "31-janv.", t: "present" }, { d: "07-févr.", t: "present" }, { d: "07-févr.", t: "present" }, { d: "17-févr.", t: "present" }, { d: "14-févr.", t: "present" }],
    [{ d: "04-avr.", t: "present" }, { d: "05-avr.", t: "present" }]
  ];
  const overrideNadaChiha = [
    [{ d: "03-mars", t: "present" }, { d: "04-mars", t: "present" }, { d: "10-mars", t: "present" }, { d: "11-mars", t: "present" }, { d: "24-mars", t: "present" }, { d: "25-mars", t: "present" }, { d: "31-mars", t: "present" }, { d: "01-avr.", t: "present" }],
    [{ d: "07-avr.", t: "present" }, { d: "08-avr.", t: "present" }]
  ];

  const isArijMnasri = student.name?.toUpperCase() === "ARIJ MNASRI";
  const isHanenBelaayeb = student.name?.toUpperCase() === "HANEN BELAAYEB";
  const isChahinezMejdoub = student.name?.toUpperCase() === "CHAHINEZ MEJDOUB";
  const isDhekraGlissi = student.name?.toUpperCase() === "DHEKRA GLISSI";
  const isYassmineGuidara = student.name?.toUpperCase() === "YASSMINE GUIDARA";
  const isNadaChiha = student.name?.toUpperCase() === "NADA CHIHA";
  const isEmnaAkrout = student.name?.toUpperCase() === "EMNA AKROUT";
  const isOmaymaHleli = student.name?.toUpperCase() === "OMAYMA HLELI";
  const isEyaAbida = student.name?.toUpperCase() === "EYA ABIDA";
  const isOmaymaBenNasser = student.name?.toUpperCase() === "OMAYMA BEN NASSER";
  const isMayssamBoulila = student.name?.toUpperCase() === "MAYSSAM BOULILA";

  const overrideEmnaAkrout = [
    [{ d: "27-janv.", t: "present" }, { d: "28-janv.", t: "present" }, { d: "03-févr.", t: "present" }, { d: "04-févr.", t: "present" }, { d: "10-févr.", t: "present" }, { d: "11-févr.", t: "present" }, { d: "17-févr.", t: "present" }, { d: "18-févr.", t: "present" }],
    [{ d: "24-févr.", t: "present" }, { d: "25-févr.", t: "present" }, { d: "03-mars", t: "present" }, { d: "04-mars", t: "present" }, { d: "10-mars", t: "present" }, { d: "11-mars", t: "present" }, { d: "24-mars", t: "present" }, { d: "25-mars", t: "present" }],
    [{ d: "31-mars", t: "present" }, { d: "01-avr.", t: "present" }, { d: "08-avr.", t: "present" }]
  ];
  const overrideOmaymaHleli = [
    [{ d: "10-févr.", t: "present" }, { d: "11-févr.", t: "present" }, { d: "17-févr.", t: "present" }, { d: "18-févr.", t: "present" }, { d: "24-févr.", t: "present" }, { d: "25-févr.", t: "present" }, { d: "03-mars", t: "present" }, { d: "10-mars", t: "present" }],
    [{ d: "24-mars", t: "present" }, { d: "25-mars", t: "present" }, { d: "31-mars", t: "present" }, { d: "01-avr.", t: "present" }, { d: "07-avr.", t: "present" }, { d: "08-avr.", t: "present" }]
  ];
  const overrideEyaAbida = [
    [{ d: "13-janv.", t: "present" }, { d: "17-janv.", t: "present" }, { d: "20-janv.", t: "present" }, { d: "24-janv.", t: "present" }, { d: "27-janv.", t: "present" }, { d: "31-janv.", t: "present" }, { d: "03-févr.", t: "present" }, { d: "07-févr.", t: "present" }],
    [{ d: "10-févr.", t: "present" }, { d: "14-févr.", t: "present" }, { d: "17-févr.", t: "present" }, { d: "24-févr.", t: "present" }, { d: "28-févr.", t: "present" }, { d: "03-mars", t: "present" }, { d: "07-mars", t: "present" }, { d: "10-mars", t: "present" }]
  ];
  const overrideOmaymaBenNasser = [
    [{ d: "24-janv.", t: "present" }, { d: "24-janv.", t: "present" }, { d: "31-janv.", t: "present" }, { d: "31-janv.", t: "present" }, { d: "07-févr.", t: "present" }, { d: "07-févr.", t: "present" }, { d: "14-févr.", t: "present" }, { d: "14-févr.", t: "present" }],
    [{ d: "28-mars", t: "present" }, { d: "28-mars", t: "present" }, { d: "04-avr.", t: "present" }, { d: "04-avr.", t: "present" }]
  ];
  const overrideMayssamBoulila = [
    [{ d: "10-déc.", t: "present" }, { d: "16-déc.", t: "present" }, { d: "17-déc.", t: "present" }, { d: "23-déc.", t: "present" }, { d: "24-déc.", t: "present" }, { d: "30-déc.", t: "present" }, { d: "31-déc.", t: "present" }, { d: "13-janv.", t: "present" }],
    [{ d: "13-janv.", t: "present" }, { d: "14-janv.", t: "present" }, { d: "20-janv.", t: "present" }, { d: "21-janv.", t: "present" }, { d: "27-janv.", t: "present" }, { d: "28-janv.", t: "present" }, { d: "03-févr.", t: "present" }, { d: "04-janv.", t: "present" }],
    [{ d: "10-févr.", t: "present" }, { d: "11-févr.", t: "present" }, { d: "17-févr.", t: "present" }, { d: "18-févr.", t: "present" }, { d: "24-févr.", t: "present" }, { d: "25-févr.", t: "present" }, { d: "03-mars", t: "present" }, { d: "04-mars", t: "present" }],
    [{ d: "10-mars", t: "present" }, { d: "11-mars", t: "present" }, { d: "28-mars", t: "present" }, { d: "29-mars", t: "present" }, { d: "31-mars", t: "present" }, { d: "01-avr.", t: "present" }, { d: "07-avr.", t: "present" }, { d: "08-avr.", t: "present" }]
  ];

  const isAmeniKarwi = student.name?.toUpperCase() === "AMENI KARWI";
  const isMounaDrira = student.name?.toUpperCase() === "MOUNA DRIRA";
  const isMariemZouari = student.name?.toUpperCase() === "MARIEM ZOUARI";
  const isHalimaChmissi = student.name?.toUpperCase() === "HALIMA CHMISSI";
  const isMaissaMallek = student.name?.toUpperCase() === "MAISSA MALLEK";
  const isSouadHamza = student.name?.toUpperCase() === "SOUAD HAMZA";
  const isSouhirGomri = student.name?.toUpperCase() === "SOUHIR GOMRI";
  const isRawyaChtourou = student.name?.toUpperCase() === "RAWYA CHTOUROU";
  const isMariemBoujelben = student.name?.toUpperCase() === "MARIEM BOUJELBEN";
  const isWafaHamedi = student.name?.toUpperCase() === "WAFA HAMEDI";
  const isRaniaTaktak = student.name?.toUpperCase() === "RANIA TAKTAK";
  const isChaymaAydi = student.name?.toUpperCase() === "CHAYMA AYDI";
  const isFatmaBenAyed = student.name?.toUpperCase() === "FATMA BEN AYED";
  const isIslemFourati = student.name?.toUpperCase() === "ISLEM FOURATI";
  const isRihemHamdi = student.name?.toUpperCase() === "RIHEM HAMDI";
  const isHibaAllahChalbi = student.name?.toUpperCase() === "HIBA ALLAH CHALBI";
  const isHajerNeji = student.name?.toUpperCase() === "HAJER NEJI";
  const isHanaAbassi = student.name?.toUpperCase() === "HANA ABASSI";
  const isAmeniTweti = student.name?.toUpperCase() === "AMENI TWETI";
  const isSalsabilHani = student.name?.toUpperCase() === "SALSABIL HENI";

  const overrideRihemHamdi = [
    [{d:"27-sept.", t:"present"}, {d:"04-oct.", t:"present"}, {d:"11-oct.", t:"present"}, {d:"11-oct.", t:"present"}, {d:"18-oct.", t:"present"}, {d:"18-oct.", t:"present"}, {d:"25-oct.", t:"present"}, {d:"25-oct.", t:"present"}],
    [{d:"01-nov.", t:"present"}, {d:"01-nov.", t:"present"}, {d:"08-nov.", t:"present"}, {d:"08-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"22-nov.", t:"present"}, {d:"22-nov.", t:"present"}],
    [{d:"29-nov.", t:"present"}, {d:"29-nov.", t:"present"}, {d:"06-déc.", t:"present"}, {d:"06-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"27-déc.", t:"present"}],
    [{d:"03-janv.", t:"present"}, {d:"03-déc.", t:"present"}, {d:"10-janv.", t:"absent"}, {d:"10-janv.", t:"absent"}, {d:"17-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"24-janv.", t:"present"}, {d:"24-janv.", t:"present"}],
    [{d:"31-janv.", t:"present"}, {d:"31-janv.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"15-févr.", t:"present"}, {d:"21-févr.", t:"present"}, {d:"21-févr.", t:"present"}],
    [{d:"08-mars", t:"present"}, {d:"08-mars", t:"present"}, {d:"14-mars", t:"absent"}, {d:"14-mars", t:"absent"}, {d:"28-mars", t:"present"}, {d:"28-mars", t:"present"}, {d:"04-avr.", t:"present"}, {d:"04-avr.", t:"present"}]
  ];

  const overrideHibaAllahChalbi = [
    [{d:"23-sept.", t:"present"}, {d:"24-sept.", t:"present"}, {d:"30-sept.", t:"present"}, {d:"01-oct.", t:"present"}, {d:"07-oct.", t:"present"}, {d:"08-oct.", t:"present"}, {d:"14-oct.", t:"present"}, {d:"15-oct.", t:"present"}],
    [{d:"21-oct.", t:"present"}, {d:"22-oct.", t:"absent"}, {d:"28-oct.", t:"present"}, {d:"29-oct.", t:"present"}, {d:"04-nov.", t:"present"}, {d:"05-nov.", t:"present"}, {d:"11-nov.", t:"present"}, {d:"12-nov.", t:"present"}],
    [{d:"15-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"22-nov.", t:"present"}, {d:"25-nov.", t:"present"}, {d:"29-nov.", t:"absent"}, {d:"02-nov.", t:"absent"}, {d:"06-déc.", t:"present"}, {d:"09-déc.", t:"present"}],
    [{d:"13-déc.", t:"present"}, {d:"16-déc.", t:"absent"}, {d:"20-déc.", t:"present"}, {d:"23-déc.", t:"present"}, {d:"27-déc.", t:"present"}, {d:"30-déc.", t:"present"}, {d:"03-janv.", t:"present"}, {d:"06-janv.", t:"present"}],
    [{d:"10-janv.", t:"present"}, {d:"13-janv.", t:"present"}, {d:"17-janv.", t:"absent"}, {d:"20-janv.", t:"present"}, {d:"24-janv.", t:"present"}, {d:"27-janv.", t:"present"}, {d:"31-janv.", t:"absent"}, {d:"03-févr.", t:"absent"}],
    [{d:"07-févr.", t:"absent"}, {d:"10-févr.", t:"present"}, {d:"14-févr.", t:"absent"}, {d:"17-févr.", t:"absent"}, {d:"21-févr.", t:"absent"}, {d:"24-févr.", t:"present"}, {d:"28-févr.", t:"absent"}, {d:"03-mars", t:"present"}],
    [{d:"07-mars", t:"absent"}, {d:"10-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"14-mars", t:"present"}, {d:"24-mars", t:"absent"}, {d:"25-mars", t:"absent"}, {d:"31-mars", t:"present"}, {d:"01-avr.", t:"present"}],
    [{d:"07-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
  ];

  const overrideHajerNeji = [
    [{d:"16-sept.", t:"present"}, {d:"17-sept.", t:"present"}, {d:"23-sept.", t:"absent"}, {d:"24-sept.", t:"present"}, {d:"30-sept.", t:"present"}, {d:"01-oct.", t:"present"}, {d:"07-oct.", t:"present"}, {d:"08-oct.", t:"present"}],
    [{d:"14-oct.", t:"present"}, {d:"15-oct.", t:"present"}, {d:"21-oct.", t:"present"}, {d:"22-oct.", t:"present"}, {d:"28-oct.", t:"present"}, {d:"29-oct.", t:"present"}, {d:"04-nov.", t:"absent"}, {d:"05-nov.", t:"present"}],
    [{d:"11-nov.", t:"absent"}, {d:"12-nov.", t:"absent"}, {d:"18-nov.", t:"present"}, {d:"19-nov.", t:"absent"}, {d:"25-nov.", t:"absent"}, {d:"26-nov.", t:"absent"}, {d:"02-nov.", t:"present"}, {d:"03-déc.", t:"present"}],
    [{d:"09-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"16-déc.", t:"absent"}, {d:"17-déc.", t:"present"}, {d:"23-déc.", t:"absent"}, {d:"24-déc.", t:"absent"}, {d:"30-déc.", t:"present"}, {d:"31-déc.", t:"absent"}],
    [{d:"06-janv.", t:"present"}, {d:"07-janv.", t:"present"}, {d:"13-janv.", t:"present"}, {d:"14-janv.", t:"absent"}, {d:"20-janv.", t:"present"}, {d:"21-janv.", t:"present"}, {d:"27-janv.", t:"present"}, {d:"28-janv.", t:"present"}],
    [{d:"03-févr.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"10-févr.", t:"present"}, {d:"11-févr.", t:"present"}, {d:"03-mars", t:"present"}, {d:"04-mars", t:"present"}, {d:"10-mars", t:"present"}, {d:"11-mars", t:"absent"}],
    [{d:"24-mars", t:"present"}, {d:"25-mars", t:"present"}, {d:"31-mars", t:"present"}, {d:"01-avr.", t:"absent"}, {d:"07-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
  ];

  const overrideHanaAbassi = [
    [{d:"30-sept.", t:"present"}, {d:"07-oct.", t:"present"}, {d:"08-oct.", t:"present"}, {d:"14-oct.", t:"present"}, {d:"15-oct.", t:"absent"}, {d:"21-oct.", t:"present"}, {d:"22-oct.", t:"present"}, {d:"28-oct.", t:"absent"}],
    [{d:"29-oct.", t:"present"}, {d:"04-nov.", t:"present"}, {d:"05-nov.", t:"absent"}, {d:"11-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"19-nov.", t:"absent"}, {d:"25-nov.", t:"present"}],
    [{d:"26-nov.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"03-déc.", t:"absent"}, {d:"09-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"16-déc.", t:"absent"}, {d:"17-déc.", t:"present"}, {d:"23-déc.", t:"absent"}],
    [{d:"24-déc.", t:"present"}, {d:"30-déc.", t:"present"}, {d:"31-déc.", t:"present"}, {d:"06-janv.", t:"present"}, {d:"07-janv.", t:"present"}, {d:"13-janv.", t:"present"}, {d:"14-janv.", t:"present"}, {d:"20-janv.", t:"present"}],
    [{d:"21-janv.", t:"present"}, {d:"27-janv.", t:"present"}, {d:"28-janv.", t:"present"}, {d:"17-févr.", t:"present"}, {d:"18-févr.", t:"present"}, {d:"25-févr.", t:"present"}, {d:"03-mars", t:"present"}, {d:"04-mars", t:"absent"}]
  ];

  const overrideAmeniTweti = [
    [{d:"17-sept.", t:"present"}, {d:"20-sept.", t:"present"}, {d:"27-sept.", t:"present"}, {d:"27-sept.", t:"present"}, {d:"04-oct.", t:"present"}, {d:"04-oct.", t:"present"}, {d:"11-oct.", t:"present"}, {d:"11-oct.", t:"present"}],
    [{d:"18-oct.", t:"present"}, {d:"18-oct.", t:"present"}, {d:"25-oct.", t:"present"}, {d:"25-oct.", t:"present"}, {d:"01-nov.", t:"present"}, {d:"01-nov.", t:"present"}, {d:"08-nov.", t:"present"}, {d:"08-nov.", t:"present"}],
    [{d:"15-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"22-nov.", t:"present"}, {d:"22-nov.", t:"present"}, {d:"29-nov.", t:"present"}, {d:"29-nov.", t:"present"}, {d:"06-déc.", t:"present"}, {d:"06-déc.", t:"present"}],
    [{d:"13-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"27-déc.", t:"present"}, {d:"27-déc.", t:"present"}, {d:"03-janv.", t:"absent"}, {d:"03-janv.", t:"absent"}],
    [{d:"10-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"24-janv.", t:"absent"}, {d:"24-janv.", t:"absent"}, {d:"31-janv.", t:"present"}, {d:"31-janv.", t:"present"}],
    [{d:"07-févr.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"14-févr.", t:"present"}, {d:"14-févr.", t:"present"}, {d:"21-févr.", t:"absent"}, {d:"21-févr.", t:"absent"}, {d:"28-févr.", t:"absent"}, {d:"28-févr.", t:"absent"}],
    [{d:"04-avr.", t:"present"}, {d:"04-avr.", t:"present"}]
  ];

  const overrideSalsabilHani = [
    [{d:"16-sept.", t:"present"}, {d:"20-sept.", t:"present"}, {d:"23-sept.", t:"present"}, {d:"27-sept.", t:"present"}, {d:"30-sept.", t:"present"}, {d:"04-oct.", t:"present"}, {d:"07-oct.", t:"present"}, {d:"11-oct.", t:"present"}],
    [{d:"14-oct.", t:"present"}, {d:"18-oct.", t:"present"}, {d:"21-oct.", t:"present"}, {d:"25-oct.", t:"present"}, {d:"28-oct.", t:"present"}, {d:"01-nov.", t:"present"}, {d:"04-nov.", t:"absent"}, {d:"08-nov.", t:"present"}],
    [{d:"11-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"22-nov.", t:"absent"}, {d:"25-nov.", t:"present"}, {d:"29-nov.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"06-déc.", t:"present"}],
    [{d:"09-déc.", t:"absent"}, {d:"13-déc.", t:"present"}, {d:"16-déc.", t:"present"}, {d:"20-déc.", t:"absent"}, {d:"23-déc.", t:"absent"}, {d:"27-déc.", t:"present"}, {d:"30-déc.", t:"present"}, {d:"03-janv.", t:"present"}],
    [{d:"06-janv.", t:"present"}, {d:"10-janv.", t:"absent"}, {d:"13-janv.", t:"absent"}, {d:"17-janv.", t:"present"}, {d:"20-janv.", t:"present"}, {d:"24-janv.", t:"absent"}, {d:"27-janv.", t:"present"}, {d:"31-janv.", t:"present"}],
    [{d:"03-févr.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"10-févr.", t:"present"}, {d:"14-févr.", t:"absent"}, {d:"17-févr.", t:"absent"}, {d:"21-févr.", t:"present"}, {d:"24-févr.", t:"absent"}, {d:"28-févr.", t:"present"}],
    [{d:"03-mars", t:"absent"}, {d:"07-mars", t:"present"}, {d:"10-mars", t:"absent"}, {d:"14-mars", t:"absent"}, {d:"24-mars", t:"absent"}, {d:"28-mars", t:"present"}, {d:"31-mars", t:"absent"}, {d:"04-avr.", t:"present"}],
    [{d:"07-avr.", t:"present"}]
  ];

  const overrideWafaHamedi = [
    [{d:"04-oct.", t:"present"}, {d:"08-oct.", t:"present"}, {d:"11-oct.", t:"present"}, {d:"15-oct.", t:"present"}, {d:"18-oct.", t:"present"}, {d:"22-oct.", t:"present"}, {d:"25-oct.", t:"present"}, {d:"29-oct.", t:"present"}],
    [{d:"01-nov.", t:"present"}, {d:"05-nov.", t:"absent"}, {d:"08-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"19-nov.", t:"present"}, {d:"22-nov.", t:"present"}, {d:"26-nov.", t:"present"}],
    [{d:"29-nov.", t:"present"}, {d:"03-déc.", t:"present"}, {d:"06-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"24-déc.", t:"present"}],
    [{d:"27-déc.", t:"present"}, {d:"31-déc.", t:"absent"}, {d:"03-janv.", t:"present"}, {d:"07-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"14-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"24-janv.", t:"present"}],
    [{d:"24-janv.", t:"present"}, {d:"31-janv.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"11-févr.", t:"present"}, {d:"14-févr.", t:"present"}, {d:"18-févr.", t:"present"}, {d:"21-févr.", t:"present"}],
    [{d:"25-févr.", t:"present"}, {d:"01-avr.", t:"present"}, {d:"04-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
  ];

  const overrideRaniaTaktak = [
    [{d:"07-oct.", t:"present"}, {d:"11-oct.", t:"present"}, {d:"14-oct.", t:"present"}, {d:"18-oct.", t:"present"}, {d:"21-oct.", t:"present"}, {d:"25-oct.", t:"present"}, {d:"28-oct.", t:"present"}, {d:"01-nov.", t:"present"}],
    [{d:"04-nov.", t:"present"}, {d:"08-nov.", t:"present"}, {d:"11-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"22-nov.", t:"present"}, {d:"25-nov.", t:"absent"}, {d:"29-nov.", t:"present"}],
    [{d:"02-déc.", t:"present"}, {d:"06-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"16-déc.", t:"present"}, {d:"20-déc.", t:"absent"}, {d:"23-déc.", t:"absent"}, {d:"27-déc.", t:"present"}, {d:"30-déc.", t:"present"}],
    [{d:"03-janv.", t:"present"}, {d:"06-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"13-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"20-janv.", t:"present"}, {d:"24-janv.", t:"present"}, {d:"27-janv.", t:"present"}],
    [{d:"31-janv.", t:"present"}, {d:"03-févr.", t:"absent"}, {d:"07-févr.", t:"present"}, {d:"10-févr.", t:"present"}, {d:"14-févr.", t:"present"}, {d:"17-févr.", t:"present"}, {d:"21-févr.", t:"absent"}, {d:"24-févr.", t:"present"}],
    [{d:"28-févr.", t:"present"}, {d:"03-mars", t:"absent"}, {d:"07-mars", t:"present"}, {d:"10-mars", t:"present"}, {d:"14-mars", t:"present"}, {d:"24-mars", t:"present"}, {d:"28-mars", t:"present"}, {d:"31-mars", t:"present"}],
    [{d:"04-avr.", t:"absent"}, {d:"07-avr.", t:"present"}]
  ];

  const overrideChaymaAydi = [
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

  const overrideFatmaBenAyed = [
    [{d:"01-oct.", t:"present"}, {d:"07-oct.", t:"present"}, {d:"08-oct.", t:"present"}, {d:"14-oct.", t:"present"}, {d:"15-oct.", t:"present"}, {d:"21-oct.", t:"present"}, {d:"22-oct.", t:"present"}, {d:"28-oct.", t:"present"}],
    [{d:"29-oct.", t:"present"}, {d:"04-nov.", t:"present"}, {d:"05-nov.", t:"present"}, {d:"11-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"19-nov.", t:"absent"}, {d:"25-nov.", t:"present"}],
    [{d:"26-nov.", t:"present"}, {d:"02-déc.", t:"present"}, {d:"03-déc.", t:"present"}, {d:"09-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"16-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"23-déc.", t:"present"}],
    [{d:"24-déc.", t:"present"}, {d:"30-déc.", t:"present"}, {d:"31-déc.", t:"present"}, {d:"03-janv.", t:"present"}, {d:"06-janv.", t:"present"}, {d:"07-janv.", t:"present"}, {d:"13-janv.", t:"present"}, {d:"14-janv.", t:"present"}],
    [{d:"20-janv.", t:"present"}, {d:"21-janv.", t:"present"}, {d:"27-janv.", t:"present"}, {d:"28-janv.", t:"present"}, {d:"03-févr.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"10-févr.", t:"present"}, {d:"11-févr.", t:"absent"}],
    [{d:"31-mars", t:"present"}]
  ];

  const overrideIslemFourati = [
    [{d:"01-oct.", t:"present"}, {d:"07-oct.", t:"present"}, {d:"08-oct.", t:"present"}, {d:"14-oct.", t:"absent"}, {d:"15-oct.", t:"present"}, {d:"21-oct.", t:"present"}, {d:"22-oct.", t:"present"}, {d:"28-oct.", t:"present"}],
    [{d:"29-oct.", t:"present"}, {d:"04-nov.", t:"present"}, {d:"05-nov.", t:"present"}, {d:"11-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"19-nov.", t:"present"}, {d:"25-nov.", t:"present"}],
    [{d:"26-nov.", t:"present"}, {d:"02-déc.", t:"present"}, {d:"03-déc.", t:"present"}, {d:"09-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"16-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"23-déc.", t:"present"}],
    [{d:"24-déc.", t:"present"}, {d:"30-déc.", t:"present"}, {d:"31-déc.", t:"absent"}, {d:"06-janv.", t:"present"}, {d:"07-janv.", t:"absent"}, {d:"13-janv.", t:"present"}, {d:"14-janv.", t:"present"}, {d:"20-janv.", t:"present"}],
    [{d:"21-janv.", t:"present"}, {d:"27-janv.", t:"present"}, {d:"28-janv.", t:"present"}, {d:"03-févr.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"10-févr.", t:"present"}, {d:"11-févr.", t:"present"}, {d:"18-févr.", t:"present"}],
    [{d:"24-févr.", t:"present"}, {d:"03-mars", t:"present"}, {d:"04-mars", t:"absent"}, {d:"10-mars", t:"absent"}, {d:"11-mars", t:"absent"}, {d:"25-mars", t:"absent"}, {d:"31-mars", t:"present"}, {d:"01-avr.", t:"present"}],
    [{d:"07-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
  ];

  const overrideMaissaMallek = [
    [{d:"14-oct.", t:"present"}, {d:"15-oct.", t:"present"}, {d:"21-oct.", t:"present"}, {d:"22-oct.", t:"present"}, {d:"28-oct.", t:"present"}, {d:"29-oct.", t:"present"}, {d:"04-nov.", t:"present"}, {d:"05-nov.", t:"present"}],
    [{d:"11-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"25-nov.", t:"present"}, {d:"26-nov.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"03-déc.", t:"present"}, {d:"09-déc.", t:"absent"}],
    [{d:"10-déc.", t:"absent"}, {d:"16-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"23-déc.", t:"present"}, {d:"24-déc.", t:"present"}, {d:"30-déc.", t:"present"}, {d:"31-déc.", t:"absent"}, {d:"06-janv.", t:"present"}],
    [{d:"07-janv.", t:"absent"}, {d:"13-janv.", t:"present"}, {d:"14-janv.", t:"present"}, {d:"20-janv.", t:"present"}, {d:"21-janv.", t:"present"}, {d:"27-janv.", t:"present"}, {d:"03-févr.", t:"present"}, {d:"04-févr.", t:"present"}],
    [{d:"10-févr.", t:"present"}, {d:"11-févr.", t:"present"}, {d:"17-févr.", t:"present"}, {d:"18-févr.", t:"present"}, {d:"03-mars", t:"present"}, {d:"04-mars", t:"present"}, {d:"10-mars", t:"present"}, {d:"11-mars", t:"present"}],
    [{d:"24-mars", t:"absent"}, {d:"25-mars", t:"absent"}, {d:"31-mars", t:"present"}, {d:"01-avr.", t:"present"}, {d:"07-avr.", t:"present"}]
  ];

  const overrideSouadHamza = [
    [{d:"11-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"19-nov.", t:"present"}, {d:"25-nov.", t:"present"}, {d:"26-nov.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"03-déc.", t:"present"}],
    [{d:"09-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"16-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"23-déc.", t:"absent"}, {d:"24-déc.", t:"present"}, {d:"30-déc.", t:"present"}, {d:"31-déc.", t:"present"}],
    [{d:"06-janv.", t:"present"}, {d:"07-janv.", t:"absent"}, {d:"13-janv.", t:"present"}, {d:"14-janv.", t:"present"}, {d:"20-janv.", t:"present"}, {d:"21-janv.", t:"present"}, {d:"27-janv.", t:"present"}, {d:"28-janv.", t:"present"}],
    [{d:"03-févr.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"10-févr.", t:"absent"}, {d:"11-févr.", t:"present"}, {d:"17-févr.", t:"present"}, {d:"18-févr.", t:"present"}, {d:"24-févr.", t:"present"}, {d:"25-févr.", t:"present"}],
    [{d:"03-mars", t:"present"}, {d:"04-mars", t:"present"}, {d:"10-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"28-mars", t:"present"}, {d:"28-mars", t:"present"}, {d:"31-mars", t:"present"}, {d:"01-avr.", t:"present"}],
    [{d:"07-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
  ];

  const overrideSouhirGomri = [
    [{d:"14-oct.", t:"present"}, {d:"15-oct.", t:"present"}, {d:"21-oct.", t:"present"}, {d:"22-oct.", t:"absent"}, {d:"28-oct.", t:"present"}, {d:"29-oct.", t:"present"}, {d:"29-oct.", t:"present"}, {d:"04-nov.", t:"present"}],
    [{d:"11-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"19-nov.", t:"present"}, {d:"25-nov.", t:"absent"}, {d:"26-nov.", t:"present"}, {d:"02-nov.", t:"present"}, {d:"03-déc.", t:"present"}],
    [{d:"09-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"16-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"23-déc.", t:"present"}, {d:"24-déc.", t:"present"}, {d:"30-déc.", t:"present"}, {d:"31-déc.", t:"absent"}],
    [{d:"03-janv.", t:"present"}, {d:"06-janv.", t:"present"}, {d:"07-janv.", t:"absent"}, {d:"13-janv.", t:"present"}, {d:"14-janv.", t:"present"}, {d:"20-janv.", t:"present"}, {d:"21-janv.", t:"present"}, {d:"27-janv.", t:"present"}],
    [{d:"03-janv.", t:"absent"}, {d:"04-févr.", t:"present"}, {d:"10-févr.", t:"absent"}, {d:"11-févr.", t:"absent"}, {d:"17-févr.", t:"present"}, {d:"18-févr.", t:"present"}, {d:"24-févr.", t:"absent"}, {d:"03-mars", t:"present"}],
    [{d:"04-mars", t:"present"}, {d:"10-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"24-mars", t:"absent"}, {d:"25-mars", t:"absent"}, {d:"31-mars", t:"absent"}, {d:"01-avr.", t:"absent"}, {d:"07-avr.", t:"absent"}]
  ];

  const overrideRawyaChtourou = [
    [{d:"07-oct.", t:"present"}, {d:"11-oct.", t:"present"}, {d:"14-oct.", t:"present"}, {d:"18-oct.", t:"present"}, {d:"21-oct.", t:"present"}, {d:"25-oct.", t:"present"}, {d:"28-oct.", t:"present"}, {d:"01-nov.", t:"present"}],
    [{d:"04-nov.", t:"present"}, {d:"08-nov.", t:"absent"}, {d:"11-nov.", t:"present"}, {d:"15-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"19-nov.", t:"absent"}, {d:"25-nov.", t:"present"}, {d:"26-nov.", t:"present"}],
    [{d:"02-nov.", t:"present"}, {d:"09-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"16-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"23-déc.", t:"present"}, {d:"27-déc.", t:"present"}, {d:"30-déc.", t:"present"}],
    [{d:"03-janv.", t:"present"}, {d:"06-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"13-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"20-janv.", t:"present"}, {d:"24-janv.", t:"present"}, {d:"27-janv.", t:"present"}],
    [{d:"31-janv.", t:"present"}, {d:"07-févr.", t:"absent"}, {d:"10-févr.", t:"present"}, {d:"14-févr.", t:"absent"}, {d:"17-févr.", t:"present"}, {d:"21-févr.", t:"present"}, {d:"24-févr.", t:"present"}, {d:"28-févr.", t:"present"}],
    [{d:"03-mars", t:"absent"}, {d:"07-mars", t:"present"}, {d:"10-mars", t:"absent"}, {d:"14-mars", t:"absent"}, {d:"25-mars", t:"absent"}, {d:"28-mars", t:"present"}, {d:"31-mars", t:"absent"}, {d:"04-avr.", t:"present"}],
    [{d:"07-avr.", t:"present"}]
  ];

  const overrideMariemBoujelben = [
    [{d:"01-oct.", t:"present"}, {d:"04-oct.", t:"present"}, {d:"08-oct.", t:"present"}, {d:"08-oct.", t:"present"}, {d:"15-oct.", t:"present"}, {d:"15-oct.", t:"present"}, {d:"22-oct.", t:"present"}, {d:"22-oct.", t:"present"}],
    [{d:"29-oct.", t:"present"}, {d:"29-oct.", t:"present"}, {d:"05-nov.", t:"present"}, {d:"05-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"19-nov.", t:"present"}, {d:"19-nov.", t:"present"}],
    [{d:"26-nov.", t:"present"}, {d:"26-nov.", t:"present"}, {d:"03-déc.", t:"present"}, {d:"03-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"17-déc.", t:"absent"}],
    [{d:"24-déc.", t:"present"}, {d:"24-déc.", t:"present"}, {d:"31-déc.", t:"present"}, {d:"31-déc.", t:"present"}, {d:"07-janv.", t:"absent"}, {d:"07-janv.", t:"absent"}, {d:"21-janv.", t:"present"}, {d:"21-janv.", t:"present"}],
    [{d:"28-janv.", t:"present"}, {d:"28-janv.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"04-févr.", t:"present"}, {d:"11-févr.", t:"absent"}, {d:"11-févr.", t:"present"}, {d:"18-févr.", t:"present"}, {d:"18-févr.", t:"present"}],
    [{d:"25-févr.", t:"present"}, {d:"25-févr.", t:"present"}, {d:"04-mars", t:"present"}, {d:"04-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"25-mars", t:"present"}, {d:"25-mars", t:"present"}],
    [{d:"01-avr.", t:"present"}, {d:"01-avr.", t:"present"}, {d:"08-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
  ];

  const overrideAmeniKarwi = [
    [{d:"06-déc.", t:"present"}, {d:"06-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"13-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"20-déc.", t:"present"}, {d:"27-déc.", t:"absent"}, {d:"27-déc.", t:"absent"}],
    [{d:"03-janv.", t:"absent"}, {d:"03-janv.", t:"absent"}, {d:"10-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"18-janv.", t:"present"}, {d:"18-janv.", t:"present"}, {d:"25-janv.", t:"present"}, {d:"25-janv.", t:"present"}],
    [{d:"31-janv.", t:"present"}, {d:"31-janv.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"07-févr.", t:"present"}, {d:"14-févr.", t:"present"}, {d:"14-févr.", t:"present"}, {d:"21-févr.", t:"absent"}, {d:"21-févr.", t:"absent"}],
    [{d:"28-févr.", t:"present"}, {d:"28-févr.", t:"present"}, {d:"07-mars", t:"present"}, {d:"07-mars", t:"present"}, {d:"14-mars", t:"absent"}, {d:"14-mars", t:"absent"}, {d:"28-mars", t:"present"}, {d:"28-mars", t:"present"}],
    [{d:"04-avr.", t:"present"}, {d:"04-avr.", t:"present"}]
  ];
  const overrideMounaDrira = [
    [{d:"03-janv.", t:"present"}, {d:"06-janv.", t:"present"}, {d:"10-janv.", t:"present"}, {d:"14-janv.", t:"present"}, {d:"17-janv.", t:"present"}, {d:"21-janv.", t:"present"}, {d:"07-févr.", t:"absent"}, {d:"11-févr.", t:"present"}],
    [{d:"14-févr.", t:"absent"}, {d:"18-févr.", t:"absent"}, {d:"21-févr.", t:"absent"}, {d:"25-févr.", t:"absent"}, {d:"28-févr.", t:"present"}, {d:"04-mars", t:"present"}, {d:"07-mars", t:"absent"}, {d:"11-mars", t:"present"}],
    [{d:"14-mars", t:"present"}, {d:"25-mars", t:"present"}, {d:"28-mars", t:"present"}, {d:"01-avr.", t:"present"}, {d:"04-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
  ];
  const overrideMariemZouari = [
    [{d:"05-nov.", t:"present"}, {d:"11-nov.", t:"present"}, {d:"12-nov.", t:"present"}, {d:"18-nov.", t:"present"}, {d:"19-nov.", t:"present"}, {d:"25-nov.", t:"present"}, {d:"26-nov.", t:"present"}, {d:"02-nov.", t:"present"}],
    [{d:"03-déc.", t:"present"}, {d:"09-déc.", t:"present"}, {d:"10-déc.", t:"present"}, {d:"16-déc.", t:"present"}, {d:"17-déc.", t:"present"}, {d:"23-déc.", t:"present"}, {d:"24-déc.", t:"present"}, {d:"30-déc.", t:"absent"}],
    [{d:"31-déc.", t:"absent"}, {d:"06-janv.", t:"present"}, {d:"07-janv.", t:"present"}, {d:"13-janv.", t:"absent"}, {d:"14-janv.", t:"absent"}, {d:"20-janv.", t:"present"}, {d:"21-janv.", t:"present"}, {d:"27-janv.", t:"present"}],
    [{d:"28-janv.", t:"present"}, {d:"03-févr.", t:"present"}, {d:"04-janv.", t:"present"}, {d:"10-févr.", t:"present"}, {d:"11-févr.", t:"present"}, {d:"17-févr.", t:"present"}, {d:"18-févr.", t:"present"}, {d:"24-févr.", t:"present"}],
    [{d:"25-févr.", t:"present"}, {d:"03-mars", t:"present"}, {d:"04-mars", t:"present"}, {d:"10-mars", t:"present"}, {d:"11-mars", t:"present"}, {d:"24-mars", t:"absent"}, {d:"25-mars", t:"present"}, {d:"31-mars", t:"present"}],
    [{d:"01-avr.", t:"present"}, {d:"07-avr.", t:"present"}, {d:"08-avr.", t:"present"}]
  ];
  const overrideHalimaChmissi = [
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

  // Number of expected sessions per cycle
  const maxS = (isSalsabilHani || isRihemHamdi || isHibaAllahChalbi || isHajerNeji || isHanaAbassi || isAmeniTweti || isWafaHamedi || isRaniaTaktak || isChaymaAydi || isFatmaBenAyed || isIslemFourati || isArijMnasri || isHanenBelaayeb || isChahinezMejdoub || isDhekraGlissi || isYassmineGuidara || isNadaChiha || isEmnaAkrout || isOmaymaHleli || isEyaAbida || isOmaymaBenNasser || isMayssamBoulila || isSihemSalah || isAmeniKarwi || isMounaDrira || isMariemZouari || isHalimaChmissi || isMaissaMallek || isSouadHamza || isSouhirGomri || isRawyaChtourou || isMariemBoujelben) ? 8 : (student.planning?.dimanche?.unique ? 5 : 8);

  // Group history into 12 months, each with maxS sessions
  const months = [];
  let eyaRealHistoryIndex = 0; // Track actual cycleHistory usage for Eya
  let nesrineRealHistoryIndex = 0; // Track actual cycleHistory usage for Nesrine

  let numMonths = isWidedAhmer ? 14 :
    isYosraBenTaher ? 16 :
      isRihabBouhlel ? 17 :
        isMarwaHentati ? 15 :
          isChaymaAydi ? 13 : 12;
  for (let i = 0; i < numMonths; i++) {
    const monthSessions = [];
    for (let j = 0; j < maxS; j++) {
      if (isEyaNaes) {
        if (overrideEyaNaes[i] && overrideEyaNaes[i][j]) {
          monthSessions.push({
            type: overrideEyaNaes[i][j].t,
            customDateStr: overrideEyaNaes[i][j].d
          });
        } else {
          monthSessions.push(student.cycleHistory?.[eyaRealHistoryIndex] || null);
          eyaRealHistoryIndex++;
        }
      } else if (isNesrineNafati) {
        if (overrideNesrineNafati[i] && overrideNesrineNafati[i][j]) {
          monthSessions.push({
            type: overrideNesrineNafati[i][j].t,
            customDateStr: overrideNesrineNafati[i][j].d
          });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++;
        }
      } else if (isMalekKemel) {
        if (overrideMalekKemel[i] && overrideMalekKemel[i][j]) {
          monthSessions.push({
            type: overrideMalekKemel[i][j].t,
            customDateStr: overrideMalekKemel[i][j].d
          });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++; // We reuse this tracking index safely as they are mutually exclusive
        }
      } else if (isYosraBenAli) {
        if (overrideYosraBenAli[i] && overrideYosraBenAli[i][j]) {
          monthSessions.push({
            type: overrideYosraBenAli[i][j].t,
            customDateStr: overrideYosraBenAli[i][j].d
          });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++; // We reuse this tracking index safely as they are mutually exclusive
        }
      } else if (isImenSafi) {
        if (overrideImenSafi[i] && overrideImenSafi[i][j]) {
          monthSessions.push({
            type: overrideImenSafi[i][j].t,
            customDateStr: overrideImenSafi[i][j].d
          });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++; // We reuse this tracking index safely as they are mutually exclusive
        }
      } else if (isEmnaLwetti) {
        if (overrideEmnaLouetti[i] && overrideEmnaLouetti[i][j]) {
          monthSessions.push({
            type: overrideEmnaLouetti[i][j].t,
            customDateStr: overrideEmnaLouetti[i][j].d
          });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++; // We reuse this tracking index safely as they are mutually exclusive
        }
      } else if (isHanaBrlghith) {
        if (overrideHanaBelghith[i] && overrideHanaBelghith[i][j]) {
          monthSessions.push({
            type: overrideHanaBelghith[i][j].t,
            customDateStr: overrideHanaBelghith[i][j].d
          });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++; // We reuse this tracking index safely as they are mutually exclusive
        }
      } else if (isNesrineDradra) {
        if (overrideNesrineDradra[i] && overrideNesrineDradra[i][j]) {
          monthSessions.push({
            type: overrideNesrineDradra[i][j].t,
            customDateStr: overrideNesrineDradra[i][j].d
          });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++; // We reuse this tracking index safely as they are mutually exclusive
        }
      } else if (isOmaymaHmidet) {
        if (overrideOmaymaHmidet[i] && overrideOmaymaHmidet[i][j]) {
          monthSessions.push({
            type: overrideOmaymaHmidet[i][j].t,
            customDateStr: overrideOmaymaHmidet[i][j].d
          });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++;
        }
      } else if (isRawaaBouzidi) {
        if (overrideRawaaBouzidi[i] && overrideRawaaBouzidi[i][j]) {
          monthSessions.push({
            type: overrideRawaaBouzidi[i][j].t,
            customDateStr: overrideRawaaBouzidi[i][j].d
          });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++;
        }
      } else if (isEmnaGhodhben) {
        if (overrideEmnaGhodhben[i] && overrideEmnaGhodhben[i][j]) {
          monthSessions.push({
            type: overrideEmnaGhodhben[i][j].t,
            customDateStr: overrideEmnaGhodhben[i][j].d
          });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++;
        }
      } else if (isIbtissemBdlewi) {
        if (overrideIbtissemBdlewi[i] && overrideIbtissemBdlewi[i][j]) {
          monthSessions.push({
            type: overrideIbtissemBdlewi[i][j].t,
            customDateStr: overrideIbtissemBdlewi[i][j].d
          });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++;
        }
      } else if (isMalekMkawar) {
        if (overrideMalekMkawar[i] && overrideMalekMkawar[i][j]) {
          monthSessions.push({
            type: overrideMalekMkawar[i][j].t,
            customDateStr: overrideMalekMkawar[i][j].d
          });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++;
        }
      } else if (isSiwarKaabechi) {
        if (overrideSiwarKaabechi[i] && overrideSiwarKaabechi[i][j]) {
          monthSessions.push({ type: overrideSiwarKaabechi[i][j].t, customDateStr: overrideSiwarKaabechi[i][j].d });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++;
        }
      } else if (isBassmaHamdewi) {
        if (overrideBassmaHamdewi[i] && overrideBassmaHamdewi[i][j]) {
          monthSessions.push({ type: overrideBassmaHamdewi[i][j].t, customDateStr: overrideBassmaHamdewi[i][j].d });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++;
        }
      } else if (isSalwaHani) {
        if (overrideSalwaHani[i] && overrideSalwaHani[i][j]) {
          monthSessions.push({ type: overrideSalwaHani[i][j].t, customDateStr: overrideSalwaHani[i][j].d });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++;
        }
      } else if (isMaissaBenNaser) {
        if (overrideMaissaBenNaser[i] && overrideMaissaBenNaser[i][j]) {
          monthSessions.push({ type: overrideMaissaBenNaser[i][j].t, customDateStr: overrideMaissaBenNaser[i][j].d });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++;
        }
      } else if (isTakwaHarchi) {
        if (overrideTakwaHarchi[i] && overrideTakwaHarchi[i][j]) {
          monthSessions.push({ type: overrideTakwaHarchi[i][j].t, customDateStr: overrideTakwaHarchi[i][j].d });
        } else {
          monthSessions.push(student.cycleHistory?.[nesrineRealHistoryIndex] || null);
          nesrineRealHistoryIndex++;
        }
      } else if (isMariemTrabelsi) {
        if (overrideMariemTrabelsi[i] && overrideMariemTrabelsi[i][j]) {
          monthSessions.push({ type: overrideMariemTrabelsi[i][j].t, customDateStr: overrideMariemTrabelsi[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isRihabBouali) {
        if (overrideRihabBouali[i] && overrideRihabBouali[i][j]) {
          monthSessions.push({ type: overrideRihabBouali[i][j].t, customDateStr: overrideRihabBouali[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isAichaHerchi) {
        if (overrideAichaHerchi[i] && overrideAichaHerchi[i][j]) {
          monthSessions.push({ type: overrideAichaHerchi[i][j].t, customDateStr: overrideAichaHerchi[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isManelYousfi) {
        if (overrideManelYousfi[i] && overrideManelYousfi[i][j]) {
          monthSessions.push({ type: overrideManelYousfi[i][j].t, customDateStr: overrideManelYousfi[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isRimHidri) {
        if (overrideRimHidri[i] && overrideRimHidri[i][j]) {
          monthSessions.push({ type: overrideRimHidri[i][j].t, customDateStr: overrideRimHidri[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isWidedAhmer) {
        if (overrideWidedAhmer[i] && overrideWidedAhmer[i][j]) {
          monthSessions.push({ type: overrideWidedAhmer[i][j].t, customDateStr: overrideWidedAhmer[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isSihemSalah) {
        if (overrideSihemSalah[i] && overrideSihemSalah[i][j]) {
          monthSessions.push({ type: overrideSihemSalah[i][j].t, customDateStr: overrideSihemSalah[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isYosraBenTaher) {
        if (overrideYosraBenTaher[i] && overrideYosraBenTaher[i][j]) {
          monthSessions.push({ type: overrideYosraBenTaher[i][j].t, customDateStr: overrideYosraBenTaher[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isRihabBouhlel) {
        if (overrideRihabBouhlel[i] && overrideRihabBouhlel[i][j]) {
          monthSessions.push({ type: overrideRihabBouhlel[i][j].t, customDateStr: overrideRihabBouhlel[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isMarwaHentati) {
        if (overrideMarwaHentati[i] && overrideMarwaHentati[i][j]) {
          monthSessions.push({ type: overrideMarwaHentati[i][j].t, customDateStr: overrideMarwaHentati[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isArbiaHarathi) {
        if (overrideArbiaHarathi[i] && overrideArbiaHarathi[i][j]) {
          monthSessions.push({ type: overrideArbiaHarathi[i][j].t, customDateStr: overrideArbiaHarathi[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isArijMnasri) {
        if (overrideArijMnasri[i] && overrideArijMnasri[i][j]) {
          monthSessions.push({ type: overrideArijMnasri[i][j].t, customDateStr: overrideArijMnasri[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isHanenBelaayeb) {
        if (overrideHanenBelaayeb[i] && overrideHanenBelaayeb[i][j]) {
          monthSessions.push({ type: overrideHanenBelaayeb[i][j].t, customDateStr: overrideHanenBelaayeb[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isChahinezMejdoub) {
        if (overrideChahinezMejdoub[i] && overrideChahinezMejdoub[i][j]) {
          monthSessions.push({ type: overrideChahinezMejdoub[i][j].t, customDateStr: overrideChahinezMejdoub[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isDhekraGlissi) {
        if (overrideDhekraGlissi[i] && overrideDhekraGlissi[i][j]) {
          monthSessions.push({ type: overrideDhekraGlissi[i][j].t, customDateStr: overrideDhekraGlissi[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isYassmineGuidara) {
        if (overrideYassmineGuidara[i] && overrideYassmineGuidara[i][j]) {
          monthSessions.push({ type: overrideYassmineGuidara[i][j].t, customDateStr: overrideYassmineGuidara[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isNadaChiha) {
        if (overrideNadaChiha[i] && overrideNadaChiha[i][j]) {
          monthSessions.push({ type: overrideNadaChiha[i][j].t, customDateStr: overrideNadaChiha[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isEmnaAkrout) {
        if (overrideEmnaAkrout[i] && overrideEmnaAkrout[i][j]) {
          monthSessions.push({ type: overrideEmnaAkrout[i][j].t, customDateStr: overrideEmnaAkrout[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isOmaymaHleli) {
        if (overrideOmaymaHleli[i] && overrideOmaymaHleli[i][j]) {
          monthSessions.push({ type: overrideOmaymaHleli[i][j].t, customDateStr: overrideOmaymaHleli[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isEyaAbida) {
        if (overrideEyaAbida[i] && overrideEyaAbida[i][j]) {
          monthSessions.push({ type: overrideEyaAbida[i][j].t, customDateStr: overrideEyaAbida[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isOmaymaBenNasser) {
        if (overrideOmaymaBenNasser[i] && overrideOmaymaBenNasser[i][j]) {
          monthSessions.push({ type: overrideOmaymaBenNasser[i][j].t, customDateStr: overrideOmaymaBenNasser[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isSihemSalah) {
        if (overrideSihemSalah[i] && overrideSihemSalah[i][j]) {
          monthSessions.push({ type: overrideSihemSalah[i][j].t, customDateStr: overrideSihemSalah[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isAmeniKarwi) {
        if (overrideAmeniKarwi[i] && overrideAmeniKarwi[i][j]) {
          monthSessions.push({ type: overrideAmeniKarwi[i][j].t, customDateStr: overrideAmeniKarwi[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isMounaDrira) {
        if (overrideMounaDrira[i] && overrideMounaDrira[i][j]) {
          monthSessions.push({ type: overrideMounaDrira[i][j].t, customDateStr: overrideMounaDrira[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isMariemZouari) {
        if (overrideMariemZouari[i] && overrideMariemZouari[i][j]) {
          monthSessions.push({ type: overrideMariemZouari[i][j].t, customDateStr: overrideMariemZouari[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isHalimaChmissi) {
        if (overrideHalimaChmissi[i] && overrideHalimaChmissi[i][j]) {
          monthSessions.push({ type: overrideHalimaChmissi[i][j].t, customDateStr: overrideHalimaChmissi[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isMaissaMallek) {
        if (overrideMaissaMallek[i] && overrideMaissaMallek[i][j]) {
          monthSessions.push({ type: overrideMaissaMallek[i][j].t, customDateStr: overrideMaissaMallek[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isSouadHamza) {
        if (overrideSouadHamza[i] && overrideSouadHamza[i][j]) {
          monthSessions.push({ type: overrideSouadHamza[i][j].t, customDateStr: overrideSouadHamza[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isSouhirGomri) {
        if (overrideSouhirGomri[i] && overrideSouhirGomri[i][j]) {
          monthSessions.push({ type: overrideSouhirGomri[i][j].t, customDateStr: overrideSouhirGomri[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isRawyaChtourou) {
        if (overrideRawyaChtourou[i] && overrideRawyaChtourou[i][j]) {
          monthSessions.push({ type: overrideRawyaChtourou[i][j].t, customDateStr: overrideRawyaChtourou[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isMariemBoujelben) {
        if (overrideMariemBoujelben[i] && overrideMariemBoujelben[i][j]) {
          monthSessions.push({ type: overrideMariemBoujelben[i][j].t, customDateStr: overrideMariemBoujelben[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isWafaHamedi) {
        if (overrideWafaHamedi[i] && overrideWafaHamedi[i][j]) {
          monthSessions.push({ type: overrideWafaHamedi[i][j].t, customDateStr: overrideWafaHamedi[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isRaniaTaktak) {
        if (overrideRaniaTaktak[i] && overrideRaniaTaktak[i][j]) {
          monthSessions.push({ type: overrideRaniaTaktak[i][j].t, customDateStr: overrideRaniaTaktak[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isChaymaAydi) {
        if (overrideChaymaAydi[i] && overrideChaymaAydi[i][j]) {
          monthSessions.push({ type: overrideChaymaAydi[i][j].t, customDateStr: overrideChaymaAydi[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isFatmaBenAyed) {
        if (overrideFatmaBenAyed[i] && overrideFatmaBenAyed[i][j]) {
          monthSessions.push({ type: overrideFatmaBenAyed[i][j].t, customDateStr: overrideFatmaBenAyed[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isIslemFourati) {
        if (overrideIslemFourati[i] && overrideIslemFourati[i][j]) {
          monthSessions.push({ type: overrideIslemFourati[i][j].t, customDateStr: overrideIslemFourati[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isRihemHamdi) {
        if (overrideRihemHamdi[i] && overrideRihemHamdi[i][j]) {
          monthSessions.push({ type: overrideRihemHamdi[i][j].t, customDateStr: overrideRihemHamdi[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isHibaAllahChalbi) {
        if (overrideHibaAllahChalbi[i] && overrideHibaAllahChalbi[i][j]) {
          monthSessions.push({ type: overrideHibaAllahChalbi[i][j].t, customDateStr: overrideHibaAllahChalbi[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isHajerNeji) {
        if (overrideHajerNeji[i] && overrideHajerNeji[i][j]) {
          monthSessions.push({ type: overrideHajerNeji[i][j].t, customDateStr: overrideHajerNeji[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isHanaAbassi) {
        if (overrideHanaAbassi[i] && overrideHanaAbassi[i][j]) {
          monthSessions.push({ type: overrideHanaAbassi[i][j].t, customDateStr: overrideHanaAbassi[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isAmeniTweti) {
        if (overrideAmeniTweti[i] && overrideAmeniTweti[i][j]) {
          monthSessions.push({ type: overrideAmeniTweti[i][j].t, customDateStr: overrideAmeniTweti[i][j].d });
        } else { monthSessions.push(null); }
      } else if (isSalsabilHani) {
        if (overrideSalsabilHani[i] && overrideSalsabilHani[i][j]) {
          monthSessions.push({ type: overrideSalsabilHani[i][j].t, customDateStr: overrideSalsabilHani[i][j].d });
        } else { monthSessions.push(null); }
      } else {
        const historyIndex = i * maxS + j;
        monthSessions.push(student.cycleHistory?.[historyIndex] || null);
      }
    }
    months.push({ number: i + 1, sessions: monthSessions });
  }

  const initials = student.name ? student.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  const isMonthPaid = (monthNum) => {
    return student.paidMonths?.includes(monthNum);
  };

  const infoDateToDisplay = (isWidedAhmer) ? "05-janv." :
    (isSihemSalah) ? "27/09/2025" :
      (isYosraBenTaher) ? "22-sept." :
        (isRihabBouhlel) ? "01-sept." :
          (isMarwaHentati) ? "20-oct." :
            (isArbiaHarathi) ? "22-sept." :
              (isArijMnasri) ? "08-avr." :
                (isHanenBelaayeb) ? "31-mars" :
                  (isChahinezMejdoub) ? "08-janv." :
                    (isDhekraGlissi) ? "04-mars" :
                      (isYassmineGuidara) ? "24-janv." :
                        (isNadaChiha) ? "03-mars" :
                          (isEmnaAkrout) ? "27-janv." :
                            (isOmaymaHleli) ? "10-févr." :
                              (isEyaAbida) ? "13-janv." :
                                (isOmaymaBenNasser) ? "24-janv." :
                                  (isMayssamBoulila) ? "06-déc.-2025" :
                                    (isAmeniKarwi) ? "06/12/2025" :
                                      (isMounaDrira) ? "03/01/2026" :
                                        (isMariemZouari) ? "05/11/2025" :
                                          (isHalimaChmissi) ? "27/09/2025" :
                                            (isMaissaMallek) ? "14/10/2025" :
                                              (isSouadHamza) ? "11/11/2025" :
                                                (isSouhirGomri) ? "27/09/2025" :
                                                  (isRawyaChtourou) ? "07/10/2025" :
                                                    (isMariemBoujelben) ? "27/09/2025" :
                                                      (isWafaHamedi) ? "04/10/2025" :
                                                        (isRaniaTaktak) ? "07/10/2025" :
                                                          (isChaymaAydi) ? "01/10/2025" :
                                                            (isFatmaBenAyed) ? "01/10/2025" :
                                                              (isIslemFourati) ? "01/10/2025" :
                                                                (isRihemHamdi) ? "27/09/2025" :
                                                                  (isHibaAllahChalbi) ? "23/09/2025" :
                                                                    (isHajerNeji) ? "16/09/2025" :
                                                                      (isHanaAbassi) ? "30/09/2025" :
                                                                        (isAmeniTweti) ? "17/09/2025" :
                                                                          (isSalsabilHani) ? "16/09/2025" :
                                            student.inscriptionDate ? new Date(student.inscriptionDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '--';

  return (
    <div className="history-modal-overlay" onClick={onClose}>
      <div className="history-modal-content" onClick={e => e.stopPropagation()}>
        <div className="history-modal-header">
          <div className="student-info-main">
            <div className="student-details-text">
              <h2>{student.name}</h2>
              <br />
              <div className="student-meta-grid">
                <div className="meta-item">
                </div>
                <div className="meta-item">
                </div>
              </div>
            </div>
          </div>
          <button className="history-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="history-info-cards">
          <div className="info-card">
            <div className="card-icon orange">
              <Calendar size={20} />
            </div>
            <div className="card-content">
              <span className="label">DATE D'INSCRIPTION / تاريخ التسجيل</span>
              <span className="value">{infoDateToDisplay}</span>
            </div>
          </div>

          <div className="info-card cin-card">
            {student.idCardImage ? (
              <img src={student.idCardImage} alt="CIN" className="cin-preview" />
            ) : (
              <div className="cin-placeholder">
                <ImageIcon size={24} />
                <span>Aucune photo CIN</span>
              </div>
            )}
          </div>
        </div>

        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>MOIS</th>
                {[...Array(maxS)].map((_, i) => (
                  <th key={i}>S{i + 1}</th>
                ))}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month) => {
                const isPaid = isMonthPaid(month.number);
                return (
                  <tr key={month.number} className={isPaid ? 'paid-row' : 'unpaid-row'}>
                    <td className="cycle-number-cell">
                      <span className="cycle-num">{month.number}</span>
                    </td>
                    {month.sessions.map((originalSession, idx) => {
                      const historyIndex = (month.number - 1) * maxS + idx;
                      const session = student.cycleHistory?.[historyIndex] || originalSession;
                      const displayType = student.historyOverrides?.[historyIndex] || session?.type;
                      return (
                        <td key={idx}>
                          <div className={`status-dot-container ${session ? 'has-data' : ''}`}>
                            {session && displayType !== 'deleted' && (
                              <div className="dot-wrapper">
                                <div className="dot-interactive-wrapper">
                                  <div
                                    className={`status-dot ${displayType}`}
                                    onClick={() => onToggleCompensated(student._id, historyIndex, session.type)}
                                    style={{ cursor: 'pointer' }}
                                  ></div>
                                  <button 
                                    className="delete-session-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteSession(student._id, historyIndex);
                                    }}
                                    title="Supprimer la session"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                                <span className="session-date">
                                  {session.customDateStr
                                    ? session.customDateStr
                                    : new Date(session.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
                                  }
                                </span>
                              </div>
                            )}
                            {(!session || displayType === 'deleted') && <div className="status-dot empty"></div>}
                          </div>
                        </td>
                      );
                    })}
                    <td className="action-cell">
                      <button
                        className={`payment-toggle-btn ${isPaid ? 'paid' : 'unpaid'}`}
                        onClick={() => onToggleMonthlyPayment(student._id, month.number)}
                      >
                        {isPaid ? 'PAYÉ' : 'PAYER'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentHistoryModal;
