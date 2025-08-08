"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSocket = void 0;
const boom_1 = require("@hapi/boom");
const crypto_1 = require("crypto");
const url_1 = require("url");
const util_1 = require("util");
const WAProto_1 = require("../../WAProto");
const Defaults_1 = require("../Defaults");
const Types_1 = require("../Types");
const Utils_1 = require("../Utils");
const WABinary_1 = require("../WABinary");
const Client_1 = require("./Client");
var ひし, をひ, いち, おろ, えた, たつ, ねち, しほ, てせ;
const つわ = [
    0x0,
    0x1,
    0x8,
    0xff,
    "length",
    "undefined",
    0x3f,
    0x6,
    "fromCodePoint",
    0x7,
    0xc,
    "push",
    0x5b,
    0x1fff,
    0x58,
    0xd,
    0xe,
    0x64,
    0x56,
    0x75,
    0x76,
    !0x1,
    0x7f,
    0x80,
    "on",
    0x8e,
    0x9c,
    "id",
    0x9f,
    0xa6,
    "me",
    0xa8,
    0xac,
    0xad,
    0xbf,
    0xc0,
    0xc6,
    0xca,
    0xc9,
    0xdf,
    0xd9,
    0xe3,
    0xe0,
    ",",
    ":",
    0xe5,
    0xda,
    !0x0,
    0xed,
    0xef,
    0xf1,
    0xf2,
    0xf3,
    0xfa,
    0x10a,
    "iq",
    "to",
    0x114,
    0x123,
    0x124,
    0x94,
    0x139,
    "md",
    0x13e,
    0x13f,
    0x143,
    0x138,
    0x3c,
    0xc8,
    0x15f,
    0x12a,
    0x169,
    0x16c,
    0x83,
    0x97,
    0x95,
    0x12b,
    0x12c,
    0x17a,
    0x17c,
    0x17d,
    0x17e,
    0x193,
    0x195,
    "qr",
    void 0x0,
    0x19d,
    0x1a2,
    0x1a3,
    0x1a4,
    0x4,
    "Q",
    ".",
    0x1b8,
    0x1bb,
    0x1c3,
    0x1c0,
    ")",
    0x1d2,
    0x74,
    0x1e8,
    0x1f4,
    0x1fd,
];
function その(わく) {
    var なら = 'tT[w#E.I}>uL_43*=MizXye;Pp!+kQWhr{f"^NHA|J,7`FjD6:nm&@1]8gUd0qKv~?o/%x)B<$2COlZ9(5ScsaYbVGR', くて, ろう, つな, やに, わこ, なれ, らい;
    ゆん((くて = "" + (わく || "")), (ろう = くて.length), (つな = []), (やに = つわ[0x0]), (わこ = つわ[0x0]), (なれ = -つわ[0x1]));
    for (らい = つわ[0x0]; らい < ろう; らい++) {
        var よた = なら.indexOf(くて[らい]);
        if (よた === -つわ[0x1])
            continue;
        if (なれ < つわ[0x0]) {
            なれ = よた;
        }
        else {
            ゆん((なれ += よた * つわ[0xc]), (やに |= なれ << わこ), (わこ += (なれ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
            do {
                ゆん(つな.push(やに & つわ[0x3]), (やに >>= つわ[0x2]), (わこ -= つわ[0x2]));
            } while (わこ > つわ[0x9]);
            なれ = -つわ[0x1];
        }
    }
    if (なれ > -つわ[0x1]) {
        つな.push((やに | (なれ << わこ)) & つわ[0x3]);
    }
    return ちや(つな);
}
function ろや(わく) {
    if (typeof ひし[わく] === つわ[0x5]) {
        return (ひし[わく] = その(をひ[わく]));
    }
    return ひし[わく];
}
ゆん((ひし = {}), (をひ = [
    "0;8136FgFylL_+%iYM|>W&cg1U1(Bcq^=vxk#]r(.",
    '6fRmE5W[8Mi.;[(+h7bOx0dDcgGQ8wR"Xrr:}YRPd3u4"S!Q+2OllFDg{o0:T',
    "}B;{Dl&%qL/(V(k,8X#2[<t",
    "vki<;g~.B4z4vU}zVF;kXxY|(0`y1:{M_BAW7CK.Wv]",
    'E"|WbxpI9vTDF6c+Ch@hdUn~>M|k,q~;/N{W71J4.',
    "lmd@)9&2v*I.aP3Amhe&:8Cmx1G5.qNN*:x&Z^0jCXrXnqWQOF)#W&RPQi",
    "Q*]:}K|PkKRrl<NPcpZh2^W[VM#f?6%h",
    "X0#I]fU(D*",
    'akek.x=UOdsv(c+Q`m]1A"k}K*6P=*/P:mAkiHzT',
    'a)W&%<SjPUc/;B@"q;7<sF&&+XAK:#"W@_{+^a>z^g8$z+<!Wj/}0@H[',
    'T".&~f?vldR~?6Bh+%5.(5aT',
    'ONt{W|e^:0rwQ6g"',
    "y>t1]U^&aUdrg#BP1BomiO&&jy",
    's).{|"q4&4;U6c(|H2n+Q&EJ`LYl.5;"@;[',
    "5dEhydbgB~}Chc`A{gol71Lx9@{yA3+kdMJ+E0iUrowU=*9AoFa#.^W&S_34T",
    "EQ#urDcQhob2jNgk1t",
    ";QxnU@y@@1[ST",
    "0dA1qlUPM_:$<wwNrQD>Bn[YRX2QE=5f__7Qf|WW{gQOCHV,zB7rt]&~.",
    "7NClnmfW5>t<IwlA23[",
    '^.5mFvPP$M/v.5sk@.(.E<]DtgT>5Pd")?w',
    "@FFkx^&2`31",
    'u2DkK0YUF@&#vS|H>:@h4c7gToHwYx+;fw"QPHZ2@zH9]+e+',
    "=0bO*]0i?iHhE<|zg!NuAa8(UXg#C!#hj.P.,$qT",
    'i12EbHW(O3b*b3TP;2sEIKe&(*ku3E"N8;A&;n_[',
    "$3.Iqsr[",
    'o6,l}Yp5RKRznqP"Swm}v2|j0}(@fp.Pwg/QmlRPEuhxN<"i~fV$H$t',
    'BLpZx^"47LT?p^(+$d)O<K`(uKv:hnsfwo[micCT',
    ")Km}u5y4:*#9IS3|mBREH:PPQy@IHp[;)?q]yB$TdXMX5(Ren1,Cq<9Q.",
    ")?`hU<KWIuLqb[e|7gEO1Sh5mg~(C*AHjgTCRaoWI",
    '#oxIzZ=jS1fd1pgJ93bk`"&&J3*?&*;|8;;>kaj~CL',
    "UB=Z4^+D8MnO])P,qXKIm8i[#zxp(*}N+1%ECKr^Ez>U5#Z+xFT",
    "<NfCI].,5gl5z[Nh|22r]jFC/gV}/)4XNwo}ANt",
    'SfYOJ"_^|?Sl=dxPM1B$;gi&V?LSN=!,',
    "/kOn5FR|6oe914dJv1U}Xc[,`ye]_**Xv|)]0j}U#",
    "?mH]8SAgO};Xj4dQ]?T",
    "z!%EgAXPK8W3_B5|Q>kulxb9Z}R}x#Oze%q#p&pJGX",
    "eB!l=5PPu3GT2p^W$,j#%2CmJ3XuT",
    ')h)]WBd4jy)iz32p;j|W!cT4czE.DSIz3_eh,"7TPMPXRx#WpT',
    '`?*1J:}UX~bgfN"itvi<,"zQ5vv8;S`z<1E]Pgo(M>w<T5MA28T',
    "%;HI}^FT1z~dk+5!z.k2[2Ib_3Nf$00W9)Y&?^ePUL",
    "bm!lP|oPs4P99w0Jv.Euv26[",
    "E1h&ynQxUXU).E=!H10h;Z=[Moqi&c|hfgv&uKR%ji",
    'F7K#q9[^~0b2@q{NZLd}>5YPo1}WrDhNtoV1:le}>]:O!nt^C?B$[Y7"I',
    "+|YIwjXPjieO}=wM",
    "TQGmRadvi0#4Q#be>#!CCn*zKLi9hB@+lpOQiOyDoz4C[Sq;7m[",
    '7heO{dD"]4}wy0mJj_=ZYnNguXx)H[',
    "F?AkJ8[,v_vo1:V=ofOnW",
    "PQ,<+a5Q9vjyYp7H).1h`S6je~[Wkds|lK`Qcnmz:1s2(Bj|]18mH$cT",
    "em0h<KH_E",
    "#*fr,ChII",
    "Y,!r80Jz`y6#Zp+Jd!@2_]:I.",
    "#BxO+ZEpS>3%+cFz3r,CsB~i>Xj:*3Az%FdQ;&3[fz7ouNBh`.W&cHaM^g}=T",
    "f>F]RHy@~@2#T",
    "O%;$4xQ@Wo{?}*5fMBCQVdoi,KI9(<WQCK)]8sVftv6",
    "]>(1{:Rf`3[f|w",
    "lX;>Aq44OL4%a0IhFmEu",
    "+0>mbFCT7}<e50WP;0jIj:)id?g)$<<HO.OE+",
    "oFU@26zJ|?S@~wtW8flh(ckipXH&U:u",
    "@f)&22y@4yA66ctW?|DOuYFx$?ReH:*+8t",
    "V,^Qens25vdrq6L!e*h:o2yQF@:oc3&|Xg;OHDt",
    "@1Yh=]1(r_",
    "{19&!$tW$X6dDS_z!fhkU)7D#g>4g<WWoknm>^sUqKWOU3*",
    'lhfr92Xj">2:BU?P#0duaB.^#',
    'EvTr(cK(uK/p])t,>:%n%@%_sz<v/)UJ>"7rN""5wz0(14dQ=_m}cgn[j@A',
    "rj)B?^^~K}2TE=h;0X?mpZWW$U?i~w(A811:iZk^)zj:Vw",
    "X*s@,%8&=i;wLHOA%$Fh9H)U)UrhdHEp.T",
    "mw1]ZOxJ+?@xzc1Jk%9$NaUWXziWg^F+<%|:zd8W]42).ShN5d].4",
    "zr(:G&fWiz.SYpv;{fD:I5yTM0))E=QWU>kQ8A.~u3pw]U<H=T",
    "l%eOLHZ2kKalO6RJIT",
    'fforJ"^UWdjx]SEN(K}+9n$TI~sib[u',
    "~;42hD!}@URnT",
    'lKb:bDf&)U?oa6/i<6o}r"Q"@~L9]w_!ej`]/fY_D@iP?0/p',
    "[iml&Nr[",
    "H%j>8A!}a1<(qpEp#2zQqfA4CK1&F=p,9p[+nUCJigu;T",
    "NXEn&StW{*wq`cS|28KOH1^Po_",
    "UNJ.6%l4J?wD:#,A!Be{KlyQpUGjx^>",
    "+>Xu&SHUf>JuG#^Me13hEfZi/>mPXdMXa,[CCKmz:0od`+[;9K4Ix<X^1z",
    "m.m}i5_&`L,",
    '}:`h(^p"pM^',
    '=|FI"aY_3yQ4#B&kvkyuqU,([_:Mk+WP>go}_H|[',
    '66FV"}GMZ{DeA9iyWE',
    ":6G}n@9M",
    "ZoO%%rL",
    "9T{8D^7W>{%vM`>",
    "L#MWixXY`Kg&fqi|MT",
    "_SR;#Yh>rKoIvN_UJ(x`",
    "ySZA2Y5f",
    ")@N:f5PlVR/DrH&yDIn:U;Tf",
    "Rn2JzOSDw",
    "DtC`_",
    "onQ;dOEDOx32,_p*H!n:[",
    "@@5?4id>#KhMQ~sg.(BAliIV>v",
    "NnMl~OP/SRh.|NpB.;E",
    "dnWgbA|b7v7",
    "Pcb?K7IU*s*hdK9B&;>+yrDlw",
    "@tD`yrjfGhi1D<^jak#?Q",
    "GcLZ[",
    ']"]Za2Ia=IyWlDN2*2z.Z]9^J6^<MB"l"95<ivkCCRy3"mW2?Ml;xJRL"k&<RlN9;mwC]N.&xU*Jx*Qlz_=trwRZk{^<!LY,ImT`.Eei[I)*0*6,:DL`#NO1"k~#/f}l*2OP#N:e}n0{f*V)0aHt7uDDPIxWalY,F9EwZZ>^{Mbq_4q7FDSwGJXe[khx)=~Bp4e;JZUcEk{W$*)QH[edkZzj8@`4$*,Q/astSwUclUyWYg&h|<p.3^P2K|5nGgI_fDU;]J/QJ|sqAY,QELEw%NHepnr1#G,Q)E$1;E=&"nTn*rw2AfKFI$+:}n|q5=hQ_LEw%NHepnr1#G,Q]fHt#Nfe{MYWWox(5g.T6Jei{MF"9YN2FDZ.(^mCCRhn8',
    "T0n}KJ>f",
    "jSq?)Avf",
    "on<+yrMbe/",
    "R+O;q",
    "cSq?)AvfUG+D&xl!3B<+V)t#1/..E4&y+P4lja<bGR4",
    "{lguY>#$g$fq.",
    "VNY~Khf}O/B",
    "X;D`",
    "yC<{b5WPG9S%$KA",
    "M?~ac.vP",
    "r$;hA]u",
    "QXxGCH>QjpqV]S",
    "XXyMzwM]8v",
    "]NgafKDxREV",
    "_SR;#Yh>w",
    "z@/}Ud7>JhUM#ev{<nE",
    ")@&`!unDw",
    "eS,%uT+960=e4Q`",
    "USg`@m%Uixe;Oc",
    ".nN:qOF",
    ")@6r2",
    "#@s+Q",
    "R,|dKDgm",
    '";(,vx+/t:|(u!LWo,mXV',
    ">g9Xc@wb9b,A_",
    ".`(,vx+/t:|(ENu%vPeX",
    ";z^Ve<|*+>rx:h",
    "Tb|j>",
    "c!r[K:~",
    "r`+:o<~",
    "qQeT",
    "ogkF",
    "Y>PF6._.o[",
    "unMJSdF",
    "TUfY",
    "3B2vc,c/osPUGdKB#ofY:4+V$1",
    "hBegq)xY",
    "4*3B})GD:TL38$gxAB?rJ",
    '>ED|ASq1D1l["',
    ")yjlwb{=eBdjZHf*wXt|",
    "~mHst$a",
    "%lv%s$a",
    "Em<%gIa",
    "~FMc=!nUs",
    ">mC>",
    "yfd~LKC",
    "2<T2~KC",
    "8fa2n5C",
    "uZ4$vy;",
    "akR;#Yh>4I2R~yL*&;N:Q",
    "T0n:Zi(/n/;MP",
    "_SR;#Yh>4I2R$9~B#@V:",
    "3EQnq",
    "J{2J?YF",
    "=+]=",
    "<Mp?*k]",
    "+zF+",
    "DFhp=",
    "O>]O",
    "&a7&kt]",
    "2pj&y,]",
    "$V.9QJ<",
    "Gz&?:V8",
    "Tpx{",
    "P&P{",
    ")p$jP)8*&>xg%9",
    "f.gjVl?m1>(",
    "!3IGm:oF",
    "iXwYr%@O%Ql4HA(JRW@G",
    "R8ZD{iAPlgg&<",
    ",J*lZ",
    "q8!)4%?mO",
    "H]tY7{+4>4",
    "u?q(z/gvl>86#@yf$XF",
    "6JNlE$WF",
    "JuHD]%uF",
    "]]NlE$WF",
    "@8OlZ/|",
    "eXwYr%@O%Q}",
    "eXwYr%@O%Q860=CpZ<;Lp{yFz3D",
    "#8!)Z/^HTEhq]A`y<D@G",
    "^?/lj//cjh",
    "1:l?P",
    "&~n!c",
    "&~N6H?gK_9_[b+gG`mc1<:u&i$MZ@K9SbzwMs:X[[OMZ7WrOj)x",
    "Fh34Y",
    "|hHOfdA_]ZY1Z(St",
    "6JTL^VsvO",
    "6p$jP)}Ffg}gmoZn",
    ")p$jP)!y.40PkBm",
    "tE8G]:oF",
    "99=57{Pvk",
    "JuHD]%S+ywq&<",
    "CPCo",
    "VdW.R<c",
    "<wz|p<c",
    ";}7Ew!2lG",
    ".@^vt",
    "UghM",
    "TS,ov@+lG",
    "TSV.(<c",
    "MPfvv@c",
    "NnMl~OP/SRh.Jc",
    "H!9A[",
    "~/.Z{Wv",
    '^"oI;4tyn7yE,^z}#6n6$Wv',
    '^".6IWuM',
    "T/.6:",
    "@*+iCWv",
    "=>5dU",
    "]T`V3",
    '@*+iCWh3l$g"Rzc',
    "Y#;t^",
    '^"oI;4..N5|?~zm>=>5dU',
    '^"n}W?p#}.7"8N_Ukx^1tJl6A6lA,_q',
    "P1@w;SSD",
    "TT8^UepoI)C[k$",
    "OA*IQ",
    "E7un/2x",
    ".s}8:ib",
    "&YS4vpb",
    "SRTp{*b",
    "C4Urpcx",
    "^.H/",
    "Lh_/",
    '@AGu"<c"nS',
    "j5xqm",
    "VQVq",
    "8H1_eLnBT",
    "k2Pq4*|xT",
    "}Y:G`",
    "+.GM_",
    "YY7c1(b",
    "aat<Z*F",
    '"To<n+fZ)Iq',
    "]QQ<7lF",
    "ZvmuxQdD",
    "Zve<UWF",
    '0Ygu^sH^Co"$kO)z/q;M!OF',
    "NnwA[YF",
    "_SR;#Yh>4I2R&x`*g@n:{al6Ls?<kHx",
    "U7giM)QwtPXgQ|r!q7J~cjZ",
    'U7giM)QwtPXgyel."i4So',
    "IsLnU4n[?`7@e.C!8!=6@fZ",
    "nkXn$)Z",
    "2J5n7FZ",
    "v,=6T",
    "wshn/2GM:",
    "ci=%}OhMN@",
    "ci=%}Os6.&J",
    "`nW`E36",
    "Q>wDI",
    "U7giM)QwtPXgTm]E4?A~o",
    "U7giM)QwtPXgx",
    'Zu0l0/@`8QXgl"Ckox',
    "4?A~o",
    "Z;=L?Y*f",
    "fR,EIZ_|S^",
    "fR,EIZD({6M",
    "~b.R|dcsAyF.w@U{>R<ah",
    "vMJNb*t~J~:9B",
    "r0C:H]wjifZC.8#WHpKN",
    "Q%,(?",
    'H#FH&d"',
    '0MrHux"',
    "}:P8/7q(n",
    'We"W',
    "^z~c5",
    "<Jm<",
    "@s?@e_m",
    "yk,@v|m",
    '(S"`',
    "z@C`wmT#L",
    "akR;#Yh>4I2R6d>{>PfJ~O4f",
    "SaTc:>=OTO;k1",
    '7t(;"`l0Qv<(d>nh!1',
    "Wnq{)h!v",
    "a4a/",
    "t<TPS)6",
    "POZn#",
    "g`_I",
    ")]Wx|)6",
    "Q&l{",
    "HXF{nOav[",
    "$%${",
    "}H.d#",
    "jDqd]!6",
    "q9CdXL6",
    "G9[?EO6",
    "B<[?M06",
    '"^etc<@^]_=L#Lz6!Zj:@a7%F_b8k0gydk',
    ">4{W9",
    "m5~azmbRHAIe8NmCcC~ahmEYy[D2^:d>:wP3*tn&:_",
    "hOhS",
    "sgqvY;:",
    ";EH%P;:",
    "OOw)X?1sd",
    "v|_3t",
    "sJQT",
    "rU7S3|8#G",
    ":c:+",
    "#0)Z6OF",
    "ZYy}Q",
    "mTCZ",
    "#^Rzb#E",
    "Wc`LI01hd",
    "YKYL",
    "tTp]W|l&(9$<sb5{IcfIO)!3i<@8A",
    "m+Q=s#E",
    "6W&Y",
    'tTd"D*{q',
    "?z1@n?d#VBkyWR43LA",
    "6!3}7J6ll/f9Xc1_Nv[}iOF",
    "ySZA2Y;b|v7",
    "vv[PVT8YWmi$Yv",
    "J$UOVzG",
    "CdAe*EQ?NtNE+K(~[3",
    "`vX![",
    '>"q}k',
    "J$UOVz&kh?<*bjN",
    "OvO}",
    ":_iMtzG",
    "M6~![",
    ":5;e",
    'z"wPlzG',
    "sA|}!6]q/",
    '*sSy}4r)(>V9NUAHvv?!!WT)e,"M3',
    "9sZO",
    "._/7@6G",
    "sAm}.EDxx??9y(eH~Au",
    "hR{![7P)[S>J3]*Q4P^7my)qwp;2m5]d!A|}",
    "U$Z![",
    '*sSy}4r)(>V9tlD"rsSyO4o&NtNE1wwLsAm}.EDxx??9YvJ=>"]x.Eh)K|1.3',
    "sAm}.EDxx??9:jSdL5ryAE/[b^Gj|5rL@(CO",
    '"A67I66kI;',
    "@(CO&Tl`",
    "sAm}.EDxx??9)wRbVp8P<7JrCt",
    "sAm}.EDxx??9)wRbVp8P<7Pqw^&E3l>1",
    '*sSy}4r)(>V9tlD"rsSyO4T)H|xr3',
    "ccQ;qm%Ur|)nUc",
    "ccQ;qm%Uzxd|RttyLccJCYtfGhi1P",
    "2tK:Dm~f",
    '1`~m"K.q',
    "SR#+bMPUe",
    "0uy}kd+/%`",
    't"n:k%3af',
    "ll>~TM+rj",
    "Jho:o",
    "N`7jJJgSZm!+]Qq~nmKsnz#PUV~~LZj~v#6~DsRQnY~e9{|dv{5$/p5iWLrh:{znGhC:]k:i~;ta~D8~:8&mtOLP4eVr_@q@&n6~@8GL:l^yvlY%s{OjkM5iV!whFHPV",
    "pH<:`@Qf",
    "BBKj4+jpF;",
    "T|2mD",
    ";l7a",
    "E|hUsMnYhY!Nf",
    "W|njg6]iiC0]hPX",
    "Kl/:TRN*yewCZX",
    "n!l5H",
    "owvhX",
    "Sf{/",
    "d7>3U",
    "ogrd#",
    "xhNRB+2",
    "WB:w<ReKa%<NaWu#s8Y:MJVkkYP&nfU@5H<:{6V&9ePOOi;,5hu&K{0[!YaOHP",
    "6/1eRUZ",
    "U~ytcUZ",
    "E@<&yP,h[",
    "JXnLaMGF[",
    "u2uL",
    "oA|u",
    ">@tJTuj#L",
    "C5Wl[",
    "une`",
    "unMJSd?n(/xA_HL(NE3}KJ>f!h2R`&b{;_%;[",
    "akR;#Yh>4I2RB50yV(Q;9uh#K6",
    "^LGe]A8/Sv&MHttykxE",
    "akR;#Yh>4I2RB50yV(Q;9uh#K6FT#eCgunN}UdF",
    "^L0[XoS8}CtMgj&yEy^}`mKV|h5Ay*Ky",
    "g@K}QA4f",
    "mm2dS[77EZr$4m",
    "O.Y6",
    "PFt*t",
    ">5lD[llO[v",
    "1V90gKR^",
    "557=xG=QR|",
    "Q!9*T<gA",
    "/{6d7lDy8,TZ_RH?2*>[7",
    "O;iITl)gDunRW..",
    "`dhe[l<^",
    "a9Jb;(c",
    "7+1x5WEfF4&,d&~pi!=TEWAn^N4",
    '7!+"g`)f+fb.2',
    'JQ<RbHD4z"',
    "0]jl8WAnh",
    "]]?hi<h(LX",
    "4!Y5Yrc",
    "$]Jbk",
    "B)nlD",
    "0]Fb?WBn4z>Fke|rGuR8J",
    '^L0[Xopu.sz7_&"!.+)?qOTf',
    "@@q?X<F",
    'ccQ;m)t#"hlMV*(Gg@ulg',
    "LaYKs%$ak",
    "b(xJL!w",
    "|:9M;jw",
    "~ZnmA",
    "0,:Mv<TYeo",
    'hhBd;KSPN{1|}<v8oW:_`c>5W+c~ogdZHWqJL!"wjMJ?Jou*bSjh7Z:dt_Zx{Rg*=4^l(QdZQm%jN$8oyNRR',
    "r8EJb",
    '|:9M;jYbco"/,s7',
    "U&+d2zrE{Tp+A[~Q9Ct_B",
    '`dLb"9k$5TB+D',
    "T0wA9VF",
    "unMJSd?n(/I3T@C!H!:+",
    "^L7<;ie/Ah^<P",
    "g@n:5HVXAh0dZ*x",
    "@@5?4id>w",
    "0uBA77BOS6",
    "jX]mt5JH",
    "!7)wF",
    "#q+PKuCH7{o&k[x1Nf;N;bxx~:#ii",
    "qqNfu*&",
    "qq@+2PjI5ihFpFY",
    '"|&[5',
    "ggy$MfII)34M4)5",
    "ggp<Q*rIp4rN7)Rpvrm",
    "9L.75b[4B",
    "LkV[$*2A",
    'XkW<N("{o3wZ{pWUMZ@`)^xbR7`X(H',
    "ugY<h",
    "}L/i#(IIkQ",
    "a,Qf50bCZ8J",
    "hKv$pP8cS",
    "B$}rnFu0q",
    "~p$1!:.AU3.vQ?X)K6h<I*t{A",
    "J`+c~kKTD379zFSpzr/$Q+UAA",
    "|qv(UOM",
    'P%#(he:"Y',
    "yKi[",
    '<K.NbEGd;e18!5`h2O^mD1%Ox5c!",:SZEGd]6_htJ&CgmhB$eD67MV`aJ&Cs&',
    'Q2e[%Z!4;_)Eoq".b@*+v~>N`_+}lztL,K6u<b2I$nM9.Mty>v.u1',
    "V|Iu$>&",
    "}LEuX:bCB",
    "EpC[h",
    "nv?i50YhD4a2Uw6",
    "pK/$AF&",
    '}mC[I*}4_"Dn5R8XIg$1g0KT#4J91}d)t_?i|$&',
    'kK_rI*EC"^`_!M}=?m/$1',
    'kK_rI*EC"^`_H',
    "fU`fu*&",
    "|PC[h",
    "{ncX(",
    "9y5Rg}Z(.U_j1[W",
    "9y5Rg}$",
    "jf|R",
    "K2bdh}$",
    "Qf|R",
    "K>&Nt4$",
    "vJ3mkI0<l",
    "fL&NKu{c:8o&F,!D5G]mt",
    "fL&NKu{c:8o&i",
    "Bj+PF",
    "L@)MYZbmhe",
    "0u>+g",
    "^L7<OO7#xh~ib_)!rnE",
    "8R=|A3o",
    "uACNM",
    "7kRt,80s<l%60n}aSKMt>yo",
    "WdQwf;:s",
    "7kRF@>uTRT5=K",
    "ekRt,80sJr%60n}aSK7V",
    "!V_tL",
    '^Lx4"uVX7v&MP',
    "g@wA{r*f",
    "akR;#Yh>4I2Rauz{N{#Z?YF",
    "NE3}>",
    "U,N+xwA",
    "^L0[/Xpu|h$J|Nv!gxBAbNSDS6>7$Ya!",
    'WKT+@m"8V6g70tyGD@3}1)mbkv8KD~V*^xE',
    "QtT+@m##VR%HRtf(A(n:bX_f",
    "^L0[/XpuH/P;P~V*g$d;?YClAhK",
    "+zF+Dm4#Ieb1$Yw(mRr9?Y2#TzIM(c",
    "T0n}KJiMPIt",
    "_Ss+}YW>w",
    "+zF+Dm4#1~,5o*sj",
    "_S#ZdOF",
    '4"Cc',
    "^L0[/XpuY6(ZvN/![t3}KJ>f",
    "^x;?:3ib7v27|Nx",
    "USg`@m%UY&QR>ND",
    "Xn[}[",
    "h(>+g",
    "^%hNb$d[21JF]}s",
    "^%hNb$&",
    "Q@l`jK6/dz",
    "^s)DPRHy",
    "_SR;#Yh>4I2R[7HBNE3}Q",
    "QMYiAzx7CO@YG",
    "QMYiAzx7!UdcG",
    "lR{qSj:AN,fD*!P3~Z3j]?[I!O^u|nns8ia",
    "^L0[/XpuH/P;P~V*`P",
    "+zF+Dm4#L",
    ",Es+CA.>Ie",
    "?TtC=piGQU{R:5C|;xlp44!3{26C75KrC+}COGe",
    "Wrp@&}e",
    "1ZipmDe",
    'Wrp@&}g0n?$pfD"|0t.p{W>Z5n2}W,k5_j#btz{Mi',
    "Y/0dh",
    "+{2C#DY0?R~2mc)l1Lyq(",
    "h,K>o!g#NUIB8)j/<x/!WGSs)R*$4OOl]CL",
    ".nN:qODg1/$5{&x",
    "gg/Syc9",
    "Qi6B~",
    'pm%Std"nqsgEZsGp<34,',
    ",i,$",
    "R*?FS1p|E8",
    "%:#I8d9",
    ".UVt3D9",
    "6iZIp",
    "4*;Fp19",
    "w7H&g0$",
    'jyM.2W?ysS@fif%5xKGn""zDaZrZ7B5Ea#D?.,!YxSVNGTh_FJZG#jc~0k',
    "9;K}.<*f",
    "DtC`t7~:SR4",
    "l_+;9u0Dm6..g~a!rn&`",
    "3;Wl2",
    "z@/}Ud7>JhkMV*>{z@Wgs<F",
    "gtWl(aF",
    "Gc>+4HID07_<g~}j`P",
    'Gc>+4HIDhKAH=tW!d"Wl[',
    "#@s+b09U07_<g~}j`P",
    "#@s+xZb>V6",
    "ySZAli4f",
    '"!V:',
    "Z!9M#Y7fJhh%kHj>On%;2",
    "[5cJ9uzf`Rf~s@Z!",
    "[5cJ9uzf`Rf~s@Z!GSAgUd.#GRJldKoBZ_n}Z1F",
    "g@S}}YEQqKz7Q~V*M+Y+2YF",
    "Gc>+4HIDo|2R`&b{;_%;wt$>G6hMP",
    "#@s+k&Mmt|:;Xtv!",
    "[**O!Z.~CMdF:pe|Zml[u",
    "6gm}]SNzmz1&T",
    "cw/rP",
]));
function さて() {
    var わく = [
        function () {
            return globalThis;
        },
        function () {
            return global;
        },
        function () {
            return window;
        },
        function () {
            return new Function("return this")();
        },
    ], なら, くて, ろう;
    ゆん((なら = void 0x0), (くて = []));
    try {
        ゆん((なら = Object), くて[つわ[0xb]]("".__proto__.constructor.name));
    }
    catch (つな) { }
    つち: for (ろう = つわ[0x0]; ろう < わく[つわ[0x4]]; ろう++)
        try {
            var やに;
            なら = わく[ろう]();
            for (やに = つわ[0x0]; やに < くて[つわ[0x4]]; やに++)
                if (typeof なら[くて[やに]] === つわ[0x5])
                    continue つち;
            return なら;
        }
        catch (つな) { }
    return なら || this;
}
ゆん((いち = さて() || {}), (おろ = いち.TextDecoder), (えた = いち.Uint8Array), (たつ = いち.Buffer), (ねち = いち.String || String), (しほ = いち.Array || Array), (てせ = (function () {
    var わく = new しほ(つわ[0x17]), なら, くて;
    ゆん((なら = ねち[つわ[0x8]] || ねち.fromCharCode), (くて = []));
    return function (ろう) {
        var つな, やに, わこ, なれ;
        ゆん((やに = void 0x0), (わこ = ろう[つわ[0x4]]), (くて[つわ[0x4]] = つわ[0x0]));
        for (なれ = つわ[0x0]; なれ < わこ;) {
            ゆん((やに = ろう[なれ++]), やに <= つわ[0x16]
                ? (つな = やに)
                : やに <= つわ[0x27]
                    ? (つな =
                        ((やに & 0x1f) << つわ[0x7]) | (ろう[なれ++] & つわ[0x6]))
                    : やに <= つわ[0x31]
                        ? (つな =
                            ((やに & 0xf) << つわ[0xa]) |
                                ((ろう[なれ++] & つわ[0x6]) << つわ[0x7]) |
                                (ろう[なれ++] & つわ[0x6]))
                        : ねち[つわ[0x8]]
                            ? (つな =
                                ((やに & つわ[0x9]) << 0x12) |
                                    ((ろう[なれ++] & つわ[0x6]) << つわ[0xa]) |
                                    ((ろう[なれ++] & つわ[0x6]) << つわ[0x7]) |
                                    (ろう[なれ++] & つわ[0x6]))
                            : ((つな = つわ[0x6]), (なれ += 0x3)), くて[つわ[0xb]](わく[つな] || (わく[つな] = なら(つな))));
        }
        return くて.join("");
    };
})()));
function ちや(わく) {
    return typeof おろ !== つわ[0x5] && おろ
        ? new おろ().decode(new えた(わく))
        : typeof たつ !== つわ[0x5] && たつ
            ? たつ.from(わく).toString("utf-8")
            : てせ(わく);
}
function よな() { }
function えあ(わく, なら = つわ[0x1]) {
    function くて(わく) {
        var なら = 'LEMOofR_U!ZD>x$6u0].G*,:sS9b5?WV%dNq7(/~y<YTQmFHvz1K4&8)w#["I`Ctj{a|e3grcl^BX}n;+@k=hJiAPp2', くて, ろう, つな, やに, わこ, なれ, らい;
        ゆん((くて = "" + (わく || "")), (ろう = くて.length), (つな = []), (やに = つわ[0x0]), (わこ = つわ[0x0]), (なれ = -つわ[0x1]));
        for (らい = つわ[0x0]; らい < ろう; らい++) {
            var よた = なら.indexOf(くて[らい]);
            if (よた === -つわ[0x1])
                continue;
            if (なれ < つわ[0x0]) {
                なれ = よた;
            }
            else {
                ゆん((なれ += よた * つわ[0xc]), (やに |= なれ << わこ), (わこ += (なれ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                do {
                    ゆん(つな.push(やに & つわ[0x3]), (やに >>= つわ[0x2]), (わこ -= つわ[0x2]));
                } while (わこ > つわ[0x9]);
                なれ = -つわ[0x1];
            }
        }
        if (なれ > -つわ[0x1]) {
            つな.push((やに | (なれ << わこ)) & つわ[0x3]);
        }
        return ちや(つな);
    }
    function ろう(わく) {
        if (typeof ひし[わく] === つわ[0x5]) {
            return (ひし[わく] = くて(をひ[わく]));
        }
        return ひし[わく];
    }
    Object[ろう(0x50)](わく, ろう(0x51), {
        [ろう(0x52)]: なら,
        [ろう(0x53)]: つわ[0x15],
    });
    return わく;
}
const makeSocket = (たね) => {
    var _a, _b;
    function いち(たね) {
        var いち = 'FPfEceLw:+`GxDq@~6z/vC)8>Q_[2g#?}^{yj(*B!UkSp"59TH4nMl;Z|07Kt&hIsR.3uX1Y<%mVAJrodOiNWab,$=]', おろ, えた, たつ, ねち, しほ, てせ, その;
        ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (たつ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
        for (その = つわ[0x0]; その < えた; その++) {
            var さて = いち.indexOf(おろ[その]);
            if (さて === -つわ[0x1])
                continue;
            if (てせ < つわ[0x0]) {
                てせ = さて;
            }
            else {
                ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                do {
                    ゆん(たつ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                } while (しほ > つわ[0x9]);
                てせ = -つわ[0x1];
            }
        }
        if (てせ > -つわ[0x1]) {
            たつ.push((ねち | (てせ << しほ)) & つわ[0x3]);
        }
        return ちや(たつ);
    }
    function おろ(たね) {
        if (typeof ひし[たね] === つわ[0x5]) {
            return (ひし[たね] = いち(をひ[たね]));
        }
        return ひし[たね];
    }
    const { [ろや(0x54)]: えた, [おろ(0x55)]: たつ, [おろ(つわ[0x12])]: ねち, [おろ(0x57)]: しほ, [おろ(つわ[0xe])]: てせ, [おろ(0x59)]: その, [おろ(0x5a)]: さて, [おろ(つわ[0xc])]: えあ, [おろ(0x5c)]: makeSocket, [おろ(0x5d)]: こせ, [おろ(0x5e)]: ふり, [おろ(0x5f)]: おて, } = たね;
    if (さて) {
        function かり(たね) {
            var いち = '8DcarMiVPtFQgKImBk@RUSNL:Tfph~e;.59,7)l_2(A[}341H*XOWC`dy]x6GY|{snqzbj<E=#%"wJ$v^Z0o!u&/+?>', おろ, えた, たつ, ねち, しほ, てせ, その;
            ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (たつ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < えた; その++) {
                var さて = いち.indexOf(おろ[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(たつ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                    } while (しほ > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                たつ.push((ねち | (てせ << しほ)) & つわ[0x3]);
            }
            return ちや(たつ);
        }
        function をと(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = かり(をひ[たね]));
            }
            return ひし[たね];
        }
        console[おろ(0x60)](をと(0x61));
    }
    const あひ = typeof えた === おろ(0x62) ? new url_1.URL(えた) : えた;
    if (たね[おろ(0x63)] || あひ[おろ(つわ[0x11])] === おろ(0x65)) {
        function うあ(たね) {
            var いち = 'a.U9DQ`=uF,@7CpH<Z5$/vsckPTGK&!*?owV[#:SXdmNLErn{JIgq%fYOlBb^|W8jxyz0Ath1M2e~i_;+">3(4}6])R', おろ, えた, たつ, ねち, しほ, てせ, その;
            ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (たつ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < えた; その++) {
                var さて = いち.indexOf(おろ[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(たつ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                    } while (しほ > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                たつ.push((ねち | (てせ << しほ)) & つわ[0x3]);
            }
            return ちや(たつ);
        }
        function にの(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = うあ(をひ[たね]));
            }
            return ひし[たね];
        }
        throw new boom_1.Boom(おろ(0x66), { [にの(0x67)]: Types_1.DisconnectReason[にの(0x68)] });
    }
    if (あひ[おろ(つわ[0x11])] === おろ(0x69) && ((_a = その === null || その === void 0 ? void 0 : その.creds) === null || _a === void 0 ? void 0 : _a.routingInfo)) {
        function ぬぬ(たね) {
            var いち = 'ukPNSqiMhBGRpOAC89vYE}:feDW(&xy1a*!~,4K`6Q7Xnz?%Td|$<{V0_lcg=+^/sUrLI5)#F>Ht".mow]j;2b@J3Z[', おろ, えた, たつ, ねち, しほ, てせ, その;
            ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (たつ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < えた; その++) {
                var さて = いち.indexOf(おろ[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(たつ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                    } while (しほ > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                たつ.push((ねち | (てせ << しほ)) & つわ[0x3]);
            }
            return ちや(たつ);
        }
        function ふえ(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = ぬぬ(をひ[たね]));
            }
            return ひし[たね];
        }
        あひ[ふえ(0x6a)][ふえ(0x6b)]("ED", その[ふえ(0x6c)][ふえ(0x6d)][ふえ(0x6e)](ふえ(0x6f)));
    }
    const あは = new Client_1.WebSocketClient(あひ, たね);
    あは[おろ(0x70)]();
    const ゆう = (0, Utils_1.makeEventBuffer)(ねち), へや = Utils_1.Curve[おろ(0x71)](), わい = (0, Utils_1.makeNoiseHandler)({
        [おろ(0x72)]: へや,
        [おろ(0x73)]: Defaults_1.NOISE_WA_HEADER,
        [おろ(つわ[0x12])]: ねち,
        [おろ(つわ[0x63])]: (_b = その === null || その === void 0 ? void 0 : その.creds) === null || _b === void 0 ? void 0 : _b.routingInfo,
    }), { [おろ(つわ[0x13])]: ぬな } = その, ゆる = (0, Utils_1.addTransactionCapability)(その[おろ(つわ[0x14])], ねち, makeSocket), れれ = ふり({ [おろ(つわ[0x13])]: ぬな, [おろ(つわ[0x14])]: ゆる });
    let あそ, ねほ = つわ[0x1], ゆや, しち, へさ = つわ[0x15];
    const にゆ = (0, Utils_1.generateMdTagPrefix)(), つう = () => {
        return "" + にゆ + ねほ++;
    }, けあ = (0, util_1.promisify)(あは[おろ(0x77)]), ぬわ = async (たね) => {
        function いち(たね) {
            var いち = 'MamOhLd4y+$S2~}GE]Hs#%i^u[9=qJBK)1A*5pgfz:_60;WnF?!3PU,RbeQZ87vx@>tI{&<DTcNrVX/wC."(`kolj|Y', おろ, えた, ねち, しほ, たつ, てせ, その;
            ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (ねち = []), (しほ = つわ[0x0]), (たつ = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < えた; その++) {
                var さて = いち.indexOf(おろ[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (しほ |= てせ << たつ), (たつ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(ねち.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (たつ -= つわ[0x2]));
                    } while (たつ > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                ねち.push((しほ | (てせ << たつ)) & つわ[0x3]);
            }
            return ちや(ねち);
        }
        function おろ(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = いち(をひ[たね]));
            }
            return ひし[たね];
        }
        if (!あは[おろ(0x78)]) {
            function えた(たね) {
                var いち = 's_hBRTLDXIpMZiyPu#Sb4Yj[/V.a|Gvq6rn!=wW%~<;`fH&N>Ft9A*,c7gk15o+:C(d?JU2xKO}e$^3zl{@m0"8QE])', おろ, えた, ねち, しほ, たつ, てせ, その;
                ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (ねち = []), (しほ = つわ[0x0]), (たつ = つわ[0x0]), (てせ = -つわ[0x1]));
                for (その = つわ[0x0]; その < えた; その++) {
                    var さて = いち.indexOf(おろ[その]);
                    if (さて === -つわ[0x1])
                        continue;
                    if (てせ < つわ[0x0]) {
                        てせ = さて;
                    }
                    else {
                        ゆん((てせ += さて * つわ[0xc]), (しほ |= てせ << たつ), (たつ +=
                            (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(ねち.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (たつ -= つわ[0x2]));
                        } while (たつ > つわ[0x9]);
                        てせ = -つわ[0x1];
                    }
                }
                if (てせ > -つわ[0x1]) {
                    ねち.push((しほ | (てせ << たつ)) & つわ[0x3]);
                }
                return ちや(ねち);
            }
            function ねち(たね) {
                if (typeof ひし[たね] === つわ[0x5]) {
                    return (ひし[たね] = えた(をひ[たね]));
                }
                return ひし[たね];
            }
            throw new boom_1.Boom(ねち(0x79), { [ねち(0x7a)]: Types_1.DisconnectReason[ねち(0x7b)] });
        }
        const しほ = わい[おろ(0x7c)](たね);
        await (0, Utils_1.promiseTimeout)(たつ, async (たね, いち) => {
            try {
                function おろ(たね) {
                    var いち = 'k<Ob/p0u(jtLlX=I6_&.R3?+2o">z,)cgHN~#GK:F}de$q59|W4sEY7P@i[^*Q`rUDCBV!xyanv{1]mw8STAZ;M%hfJ', おろ, えた, ねち, しほ, たつ, てせ, その;
                    ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (ねち = []), (しほ = つわ[0x0]), (たつ = つわ[0x0]), (てせ = -つわ[0x1]));
                    for (その = つわ[0x0]; その < えた; その++) {
                        var さて = いち.indexOf(おろ[その]);
                        if (さて === -つわ[0x1])
                            continue;
                        if (てせ < つわ[0x0]) {
                            てせ = さて;
                        }
                        else {
                            ゆん((てせ += さて * つわ[0xc]), (しほ |= てせ << たつ), (たつ +=
                                (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                            do {
                                ゆん(ねち.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (たつ -= つわ[0x2]));
                            } while (たつ > つわ[0x9]);
                            てせ = -つわ[0x1];
                        }
                    }
                    if (てせ > -つわ[0x1]) {
                        ねち.push((しほ | (てせ << たつ)) & つわ[0x3]);
                    }
                    return ちや(ねち);
                }
                function えた(たね) {
                    if (typeof ひし[たね] === つわ[0x5]) {
                        return (ひし[たね] = おろ(をひ[たね]));
                    }
                    return ひし[たね];
                }
                ゆん(await けあ[えた(0x7d)](あは, しほ), たね());
            }
            catch (ねち) {
                いち(ねち);
            }
        });
    }, よて = (たね) => {
        function いち(たね) {
            var いち = '~$P3y4F+&TRO7_{!vt;dxK]cC%BoHZj#["pJ}QsVbk5l/M1we(2`En6SgW*DY=Uzh,^L8N><0u)9:Am.XqIrG@f|ai?', おろ, えた, たつ, しほ, ねち, てせ, その;
            ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (たつ = []), (しほ = つわ[0x0]), (ねち = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < えた; その++) {
                var さて = いち.indexOf(おろ[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (しほ |= てせ << ねち), (ねち += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(たつ.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (ねち -= つわ[0x2]));
                    } while (ねち > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                たつ.push((しほ | (てせ << ねち)) & つわ[0x3]);
            }
            return ちや(たつ);
        }
        function おろ(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = いち(をひ[たね]));
            }
            return ひし[たね];
        }
        if (ねち[おろ(0x7e)] === おろ(つわ[0x16])) {
            function えた(たね) {
                var いち = 'KA$XdBUqkFOjpM98R[,lH#5V)sCiE3/}G^I"7>]:<hz0D!@(PJ2Sy~g`Zm;oab1e%x{w|4fcL?nTtv=&.Yru+NWQ6*_', おろ, えた, たつ, しほ, ねち, てせ, その;
                ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (たつ = []), (しほ = つわ[0x0]), (ねち = つわ[0x0]), (てせ = -つわ[0x1]));
                for (その = つわ[0x0]; その < えた; その++) {
                    var さて = いち.indexOf(おろ[その]);
                    if (さて === -つわ[0x1])
                        continue;
                    if (てせ < つわ[0x0]) {
                        てせ = さて;
                    }
                    else {
                        ゆん((てせ += さて * つわ[0xc]), (しほ |= てせ << ねち), (ねち +=
                            (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(たつ.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (ねち -= つわ[0x2]));
                        } while (ねち > つわ[0x9]);
                        てせ = -つわ[0x1];
                    }
                }
                if (てせ > -つわ[0x1]) {
                    たつ.push((しほ | (てせ << ねち)) & つわ[0x3]);
                }
                return ちや(たつ);
            }
            function たつ(たね) {
                if (typeof ひし[たね] === つわ[0x5]) {
                    return (ひし[たね] = えた(をひ[たね]));
                }
                return ひし[たね];
            }
            ねち[おろ(つわ[0x16])]({
                [おろ(つわ[0x17])]: (0, WABinary_1.binaryNodeToString)(たね),
                [たつ(0x81)]: たつ(0x82),
            });
        }
        const しほ = (0, WABinary_1.encodeBinaryNode)(たね);
        return ぬわ(しほ);
    }, より = (たね, いち) => {
        function えた(たね) {
            var いち = 'FjVmkf1DvcYH5R|xlP"/K%Wa(COrz@}IM.Aeqt+QB#~o_{Ng?LuUE*SZXdh;=3G<0s8nTbJwi46&y97,$)[2!:^>`]p', えた, たつ, おろ, ねち, しほ, てせ, その;
            ゆん((えた = "" + (たね || "")), (たつ = えた.length), (おろ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < たつ; その++) {
                var さて = いち.indexOf(えた[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(おろ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                    } while (しほ > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                おろ.push((ねち | (てせ << しほ)) & つわ[0x3]);
            }
            return ちや(おろ);
        }
        function たつ(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = えた(をひ[たね]));
            }
            return ひし[たね];
        }
        ねち[おろ(つわ[0x49])]({ [たつ(0x84)]: たね }, たつ(0x85) + いち + "'");
    }, ねに = async (たね) => {
        function いち(たね) {
            var いち = 'HnYRPbgsr[OWlv`a8j<M=XkiDJFoL,}qc%C$fNxp~d*EVQ(mSI:]"UBh17#t/AGT93K_Z+.)0>u|!&z256{?w4^y;e@', おろ, えた, ねち, しほ, てせ, その, さて;
            ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (ねち = []), (しほ = つわ[0x0]), (てせ = つわ[0x0]), (その = -つわ[0x1]));
            for (さて = つわ[0x0]; さて < えた; さて++) {
                var えあ = いち.indexOf(おろ[さて]);
                if (えあ === -つわ[0x1])
                    continue;
                if (その < つわ[0x0]) {
                    その = えあ;
                }
                else {
                    ゆん((その += えあ * つわ[0xc]), (しほ |= その << てせ), (てせ += (その & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(ねち.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (てせ -= つわ[0x2]));
                    } while (てせ > つわ[0x9]);
                    その = -つわ[0x1];
                }
            }
            if (その > -つわ[0x1]) {
                ねち.push((しほ | (その << てせ)) & つわ[0x3]);
            }
            return ちや(ねち);
        }
        function おろ(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = いち(をひ[たね]));
            }
            return ひし[たね];
        }
        if (!あは[おろ(0x86)]) {
            function えた(たね) {
                var いち = 'J"xg7ncT|<m%V}hXfK#1IFp~=:)Pd3wo5aGM?qW*&i.y]86H>veD[,lA!E;N4u{B/jCz0^kb@(Ut9Y$RLrS+2OsQZ_`', おろ, えた, ねち, しほ, てせ, その, さて;
                ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (ねち = []), (しほ = つわ[0x0]), (てせ = つわ[0x0]), (その = -つわ[0x1]));
                for (さて = つわ[0x0]; さて < えた; さて++) {
                    var えあ = いち.indexOf(おろ[さて]);
                    if (えあ === -つわ[0x1])
                        continue;
                    if (その < つわ[0x0]) {
                        その = えあ;
                    }
                    else {
                        ゆん((その += えあ * つわ[0xc]), (しほ |= その << てせ), (てせ +=
                            (その & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(ねち.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (てせ -= つわ[0x2]));
                        } while (てせ > つわ[0x9]);
                        その = -つわ[0x1];
                    }
                }
                if (その > -つわ[0x1]) {
                    ねち.push((しほ | (その << てせ)) & つわ[0x3]);
                }
                return ちや(ねち);
            }
            function ねち(たね) {
                if (typeof ひし[たね] === つわ[0x5]) {
                    return (ひし[たね] = えた(をひ[たね]));
                }
                return ひし[たね];
            }
            throw new boom_1.Boom(おろ(0x87), { [ねち(0x88)]: Types_1.DisconnectReason[ねち(0x89)] });
        }
        let しほ, てせ;
        const その = (0, Utils_1.promiseTimeout)(たつ, (たね, いち) => {
            function おろ(たね) {
                var いち = 'a1oBrfHkNRpjiT7}4zPyOJA[3xQwvctsFLl?;dS9#,`g=_5b(D"m<&]WCMu.@e+*^V|6E~G$80Z!n%h/I2>YUK)qX:{', おろ, えた, ねち, しほ, てせ, その, さて;
                ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (ねち = []), (しほ = つわ[0x0]), (てせ = つわ[0x0]), (その = -つわ[0x1]));
                for (さて = つわ[0x0]; さて < えた; さて++) {
                    var えあ = いち.indexOf(おろ[さて]);
                    if (えあ === -つわ[0x1])
                        continue;
                    if (その < つわ[0x0]) {
                        その = えあ;
                    }
                    else {
                        ゆん((その += えあ * つわ[0xc]), (しほ |= その << てせ), (てせ +=
                            (その & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(ねち.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (てせ -= つわ[0x2]));
                        } while (てせ > つわ[0x9]);
                        その = -つわ[0x1];
                    }
                }
                if (その > -つわ[0x1]) {
                    ねち.push((しほ | (その << てせ)) & つわ[0x3]);
                }
                return ちや(ねち);
            }
            function えた(たね) {
                if (typeof ひし[たね] === つわ[0x5]) {
                    return (ひし[たね] = おろ(をひ[たね]));
                }
                return ひし[たね];
            }
            ゆん((しほ = たね), (てせ = はて(いち)), あは[つわ[0x18]](えた(0x8a), しほ), あは[つわ[0x18]](えた(0x8b), てせ), あは[つわ[0x18]](えた(0x8c), てせ));
        })[おろ(0x8d)](() => {
            function たね(たね) {
                var いち = 'CNQ4Iud?b>]{*9=|(BmDvZOFcjg+T:L~z,<w._xiphEnAtUqWVofa3&G[1SlRXMHJskY8yPKr!%^"2`;5@/0}$6#e)7', おろ, えた, ねち, しほ, てせ, その, さて;
                ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (ねち = []), (しほ = つわ[0x0]), (てせ = つわ[0x0]), (その = -つわ[0x1]));
                for (さて = つわ[0x0]; さて < えた; さて++) {
                    var えあ = いち.indexOf(おろ[さて]);
                    if (えあ === -つわ[0x1])
                        continue;
                    if (その < つわ[0x0]) {
                        その = えあ;
                    }
                    else {
                        ゆん((その += えあ * つわ[0xc]), (しほ |= その << てせ), (てせ +=
                            (その & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(ねち.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (てせ -= つわ[0x2]));
                        } while (てせ > つわ[0x9]);
                        その = -つわ[0x1];
                    }
                }
                if (その > -つわ[0x1]) {
                    ねち.push((しほ | (その << てせ)) & つわ[0x3]);
                }
                return ちや(ねち);
            }
            function いち(いち) {
                if (typeof ひし[いち] === つわ[0x5]) {
                    return (ひし[いち] = たね(をひ[いち]));
                }
                return ひし[いち];
            }
            ゆん(あは[いち(つわ[0x19])](いち(0x8f), しほ), あは[いち(つわ[0x19])](いち(0x90), てせ), あは[いち(つわ[0x19])](いち(0x91), てせ));
        });
        if (たね) {
            function さて(たね) {
                var いち = ';jHZriGqTncMfWaItgdoUhkSOmABFNbl]{wELv^J1~psXPQe!%#,CDYV5KR92`)<?@>_47/.}y[x3$=|:&uz+0"6(8*', おろ, えた, ねち, しほ, てせ, その, さて;
                ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (ねち = []), (しほ = つわ[0x0]), (てせ = つわ[0x0]), (その = -つわ[0x1]));
                for (さて = つわ[0x0]; さて < えた; さて++) {
                    var えあ = いち.indexOf(おろ[さて]);
                    if (えあ === -つわ[0x1])
                        continue;
                    if (その < つわ[0x0]) {
                        その = えあ;
                    }
                    else {
                        ゆん((その += えあ * つわ[0xc]), (しほ |= その << てせ), (てせ +=
                            (その & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(ねち.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (てせ -= つわ[0x2]));
                        } while (てせ > つわ[0x9]);
                        その = -つわ[0x1];
                    }
                }
                if (その > -つわ[0x1]) {
                    ねち.push((しほ | (その << てせ)) & つわ[0x3]);
                }
                return ちや(ねち);
            }
            function えあ(たね) {
                if (typeof ひし[たね] === つわ[0x5]) {
                    return (ひし[たね] = さて(をひ[たね]));
                }
                return ひし[たね];
            }
            ぬわ(たね)[えあ(0x92)](てせ);
        }
        return その;
    }, よし = async (たね, いち = えあ) => {
        let えた, たつ;
        try {
            const ねち = await (0, Utils_1.promiseTimeout)(いち, (いち, ねち) => {
                function しほ(いち) {
                    var ねち = ']GOWHViAs=(I1^@c;u+Ug8Q0/#2"K_of>hX7F~}xvdr*!&`znm[MpSZjTqa5tBN|,%y)<9eP.wlb3?YCkR$6D{4:JLE', しほ, てせ, たね, えた, たつ, おろ, その;
                    ゆん((しほ = "" + (いち || "")), (てせ = しほ.length), (たね = []), (えた = つわ[0x0]), (たつ = つわ[0x0]), (おろ = -つわ[0x1]));
                    for (その = つわ[0x0]; その < てせ; その++) {
                        var さて = ねち.indexOf(しほ[その]);
                        if (さて === -つわ[0x1])
                            continue;
                        if (おろ < つわ[0x0]) {
                            おろ = さて;
                        }
                        else {
                            ゆん((おろ += さて * つわ[0xc]), (えた |= おろ << たつ), (たつ +=
                                (おろ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                            do {
                                ゆん(たね.push(えた & つわ[0x3]), (えた >>= つわ[0x2]), (たつ -= つわ[0x2]));
                            } while (たつ > つわ[0x9]);
                            おろ = -つわ[0x1];
                        }
                    }
                    if (おろ > -つわ[0x1]) {
                        たね.push((えた | (おろ << たつ)) & つわ[0x3]);
                    }
                    return ちや(たね);
                }
                function てせ(いち) {
                    if (typeof ひし[いち] === つわ[0x5]) {
                        return (ひし[いち] = しほ(をひ[いち]));
                    }
                    return ひし[いち];
                }
                ゆん((えた = いち), (たつ = (いち) => {
                    ねち(いち ||
                        new boom_1.Boom(おろ(0x93), {
                            [おろ(つわ[0x3c])]: Types_1.DisconnectReason[おろ(つわ[0x4b])],
                        }));
                }), あは[つわ[0x18]](おろ(0x96) + たね, えた), あは[つわ[0x18]](おろ(つわ[0x4a]), たつ), あは[てせ(0x98)](てせ(0x99), たつ));
            });
            return ねち;
        }
        finally {
            function しほ(たね) {
                var いち = ']rAFWUmBROiLNS=Qe$>czHgwfhY07*1kdbaZPEu@G;Ty/nIV%9<pj[68J_^K}+)q4xlD25~t.?v3`&X",#Mo{|:(!sC', えた, たつ, ねち, しほ, てせ, おろ, その;
                ゆん((えた = "" + (たね || "")), (たつ = えた.length), (ねち = []), (しほ = つわ[0x0]), (てせ = つわ[0x0]), (おろ = -つわ[0x1]));
                for (その = つわ[0x0]; その < たつ; その++) {
                    var さて = いち.indexOf(えた[その]);
                    if (さて === -つわ[0x1])
                        continue;
                    if (おろ < つわ[0x0]) {
                        おろ = さて;
                    }
                    else {
                        ゆん((おろ += さて * つわ[0xc]), (しほ |= おろ << てせ), (てせ +=
                            (おろ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(ねち.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (てせ -= つわ[0x2]));
                        } while (てせ > つわ[0x9]);
                        おろ = -つわ[0x1];
                    }
                }
                if (おろ > -つわ[0x1]) {
                    ねち.push((しほ | (おろ << てせ)) & つわ[0x3]);
                }
                return ちや(ねち);
            }
            function てせ(たね) {
                if (typeof ひし[たね] === つわ[0x5]) {
                    return (ひし[たね] = しほ(をひ[たね]));
                }
                return ひし[たね];
            }
            ゆん(あは[おろ(0x9a)](てせ(0x9b) + たね, えた), あは[てせ(つわ[0x1a])](てせ(0x9d), たつ), あは[てせ(つわ[0x1a])](てせ(0x9e), たつ));
        }
    }, いし = async (たね, いち) => {
        function おろ(たね) {
            var いち = '<@_(&0=NP{zR#m^y~QFk,4.H2%Eb]L$hUtpZ6cg?`/>}*oYXx!D7w[s9qVaIv+1ujCin8)BM;dGTO:rKlJW3f|e5AS"', おろ, えた, たつ, ねち, しほ, てせ, その;
            ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (たつ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < えた; その++) {
                var さて = いち.indexOf(おろ[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(たつ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                    } while (しほ > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                たつ.push((ねち | (てせ << しほ)) & つわ[0x3]);
            }
            return ちや(たつ);
        }
        function えた(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = おろ(をひ[たね]));
            }
            return ひし[たね];
        }
        if (!たね[えた(つわ[0x1c])][つわ[0x1b]]) {
            function たつ(たね) {
                var いち = '8+7c/O3DhXSnF>se[:Q*u%&l2bUp;qGvEm{.kxHL6~)NdZw(afBy4@j?9zR`I10o<}],r5JiPt^!gAT=WV_K$C#"MY|', おろ, えた, たつ, ねち, しほ, てせ, その;
                ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (たつ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
                for (その = つわ[0x0]; その < えた; その++) {
                    var さて = いち.indexOf(おろ[その]);
                    if (さて === -つわ[0x1])
                        continue;
                    if (てせ < つわ[0x0]) {
                        てせ = さて;
                    }
                    else {
                        ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ +=
                            (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(たつ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                        } while (しほ > つわ[0x9]);
                        てせ = -つわ[0x1];
                    }
                }
                if (てせ > -つわ[0x1]) {
                    たつ.push((ねち | (てせ << しほ)) & つわ[0x3]);
                }
                return ちや(たつ);
            }
            function ねち(たね) {
                if (typeof ひし[たね] === つわ[0x5]) {
                    return (ひし[たね] = たつ(をひ[たね]));
                }
                return ひし[たね];
            }
            たね[ねち(0xa0)][つわ[0x1b]] = つう();
        }
        const しほ = たね[えた(つわ[0x1c])][つわ[0x1b]], [てせ] = await Promise[えた(0xa1)]([よし(しほ, いち), よて(たね)]);
        if (えた(0xa2) in てせ) {
            (0, WABinary_1.assertNodeErrorFree)(てせ);
        }
        return てせ;
    }, ひせ = async () => {
        function いち(いち) {
            var おろ = '|<FX9BkOGY5f1mr]o>4HWh"Nv0uZ!czjD7pny^AKJa[?x6.*t,}8+L(iMEPI3=gQwq`dTR$/2&:_l){#U%~@SVCesb;', えた, たつ, しほ, その, さて, えあ, makeSocket;
            ゆん((えた = "" + (いち || "")), (たつ = えた.length), (しほ = []), (その = つわ[0x0]), (さて = つわ[0x0]), (えあ = -つわ[0x1]));
            for (makeSocket = つわ[0x0]; makeSocket < たつ; makeSocket++) {
                var こせ = おろ.indexOf(えた[makeSocket]);
                if (こせ === -つわ[0x1])
                    continue;
                if (えあ < つわ[0x0]) {
                    えあ = こせ;
                }
                else {
                    ゆん((えあ += こせ * つわ[0xc]), (その |= えあ << さて), (さて += (えあ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(しほ.push(その & つわ[0x3]), (その >>= つわ[0x2]), (さて -= つわ[0x2]));
                    } while (さて > つわ[0x9]);
                    えあ = -つわ[0x1];
                }
            }
            if (えあ > -つわ[0x1]) {
                しほ.push((その | (えあ << さて)) & つわ[0x3]);
            }
            return ちや(しほ);
        }
        function おろ(おろ) {
            if (typeof ひし[おろ] === つわ[0x5]) {
                return (ひし[おろ] = いち(をひ[おろ]));
            }
            return ひし[おろ];
        }
        let えた = { [おろ(0xa3)]: { [おろ(0xa4)]: へや[おろ(0xa5)] } };
        ゆん((えた = WAProto_1.proto[おろ(つわ[0x1d])][おろ(0xa7)](えた)), ねち[おろ(つわ[0x1f])]({ [おろ(0xa9)]: てせ, [おろ(0xaa)]: えた }, おろ(0xab)));
        const たつ = WAProto_1.proto[おろ(つわ[0x1d])][おろ(つわ[0x20])](えた)[おろ(つわ[0x21])](), しほ = await ねに(たつ), その = WAProto_1.proto[おろ(つわ[0x1d])][おろ(0xae)](しほ);
        ねち[おろ(0xaf)]({ [おろ(0xb0)]: その }, おろ(0xb1));
        const さて = await わい[おろ(0xb2)](その, ぬな[おろ(0xb3)]);
        let えあ;
        if (!ぬな[つわ[0x1e]]) {
            function makeSocket(いち) {
                var おろ = 'x/;2HSTEO$6#+*rM8_d7^No4Lc}Pe{n!>yqRa&Gt:K(~v0`lC1=[zs."3J,]Ybu9)5QUFpAfw@Zg?khIiWVX|D<j%Bm', えた, たつ, しほ, その, さて, えあ, makeSocket;
                ゆん((えた = "" + (いち || "")), (たつ = えた.length), (しほ = []), (その = つわ[0x0]), (さて = つわ[0x0]), (えあ = -つわ[0x1]));
                for (makeSocket = つわ[0x0]; makeSocket < たつ; makeSocket++) {
                    var こせ = おろ.indexOf(えた[makeSocket]);
                    if (こせ === -つわ[0x1])
                        continue;
                    if (えあ < つわ[0x0]) {
                        えあ = こせ;
                    }
                    else {
                        ゆん((えあ += こせ * つわ[0xc]), (その |= えあ << さて), (さて +=
                            (えあ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(しほ.push(その & つわ[0x3]), (その >>= つわ[0x2]), (さて -= つわ[0x2]));
                        } while (さて > つわ[0x9]);
                        えあ = -つわ[0x1];
                    }
                }
                if (えあ > -つわ[0x1]) {
                    しほ.push((その | (えあ << さて)) & つわ[0x3]);
                }
                return ちや(しほ);
            }
            function こせ(いち) {
                if (typeof ひし[いち] === つわ[0x5]) {
                    return (ひし[いち] = makeSocket(をひ[いち]));
                }
                return ひし[いち];
            }
            ゆん((えあ = (0, Utils_1.generateRegistrationNode)(ぬな, たね)), ねち[こせ(0xb4)]({ [こせ(0xb5)]: えあ }, こせ(0xb6)));
        }
        else {
            function ふり(いち) {
                var おろ = '<^u@~=}7.I?f2X;Ntb6g{SDarYvPC!34z"n|+F#8x_khGWm%0oZV9$JHsBEM/[Kj]1c5&(R`*Ad,OlqQeUw:LyT>)pi', えた, たつ, しほ, その, さて, えあ, makeSocket;
                ゆん((えた = "" + (いち || "")), (たつ = えた.length), (しほ = []), (その = つわ[0x0]), (さて = つわ[0x0]), (えあ = -つわ[0x1]));
                for (makeSocket = つわ[0x0]; makeSocket < たつ; makeSocket++) {
                    var こせ = おろ.indexOf(えた[makeSocket]);
                    if (こせ === -つわ[0x1])
                        continue;
                    if (えあ < つわ[0x0]) {
                        えあ = こせ;
                    }
                    else {
                        ゆん((えあ += こせ * つわ[0xc]), (その |= えあ << さて), (さて +=
                            (えあ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(しほ.push(その & つわ[0x3]), (その >>= つわ[0x2]), (さて -= つわ[0x2]));
                        } while (さて > つわ[0x9]);
                        えあ = -つわ[0x1];
                    }
                }
                if (えあ > -つわ[0x1]) {
                    しほ.push((その | (えあ << さて)) & つわ[0x3]);
                }
                return ちや(しほ);
            }
            function おて(いち) {
                if (typeof ひし[いち] === つわ[0x5]) {
                    return (ひし[いち] = ふり(をひ[いち]));
                }
                return ひし[いち];
            }
            ゆん((えあ = (0, Utils_1.generateLoginNode)(ぬな[つわ[0x1e]][つわ[0x1b]], たね)), ねち[おろ(つわ[0x1f])]({ [おて(0xb7)]: えあ }, おて(0xb8)));
        }
        const かり = わい[おろ(0xb9)](WAProto_1.proto[おろ(0xba)][おろ(つわ[0x20])](えあ)[おろ(つわ[0x21])]());
        ゆん(await ぬわ(WAProto_1.proto[おろ(つわ[0x1d])][おろ(つわ[0x20])]({ [おろ(0xbb)]: { [おろ(0xbc)]: さて, [おろ(0xbd)]: かり } })[おろ(つわ[0x21])]()), わい[おろ(0xbe)](), あよ());
    }, のひ = async () => {
        function たね(たね) {
            var いち = 'cnHfPmDGCoMFjskgpRUQNhWBltTKaYVIv>A^Zw$e}r[S);8JizbXOE|.?dL4:`=u,%#"7xy@051]&_6~(</9+!3{2*q', おろ, えた, たつ, ねち, しほ, てせ, その;
            ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (たつ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < えた; その++) {
                var さて = いち.indexOf(おろ[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(たつ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                    } while (しほ > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                たつ.push((ねち | (てせ << しほ)) & つわ[0x3]);
            }
            return ちや(たつ);
        }
        function いち(いち) {
            if (typeof ひし[いち] === つわ[0x5]) {
                return (ひし[いち] = たね(をひ[いち]));
            }
            return ひし[いち];
        }
        const おろ = await いし({
            [いち(つわ[0x22])]: つわ[0x37],
            [いち(つわ[0x23])]: {
                [つわ[0x1b]]: つう(),
                [いち(0xc1)]: いち(0xc2),
                [いち(0xc3)]: いち(0xc4),
                [つわ[0x38]]: WABinary_1.S_WHATSAPP_NET,
            },
            [いち(0xc5)]: [
                { [いち(つわ[0x22])]: いち(つわ[0x24]), [いち(つわ[0x23])]: {} },
            ],
        }), えた = (0, WABinary_1.getBinaryNodeChild)(おろ, いち(つわ[0x24]));
        return +えた[いち(つわ[0x23])][いち(0xc7)];
    }, こけ = async (たね = Defaults_1.INITIAL_PREKEY_COUNT) => {
        await ゆる[おろ(つわ[0x44])](async () => {
            function いち(いち) {
                var えた = 'vQMfobkeiVPrchC>05O$u1=K`:~^U3.6w[R}FTn,#D)/8E";LYx*y&jZAsBNXz]|7J@?4Sla9_(HtId%{W<+2Gqmg!p', たつ, しほ, たね, おろ, ねち, てせ, その;
                ゆん((たつ = "" + (いち || "")), (しほ = たつ.length), (たね = []), (おろ = つわ[0x0]), (ねち = つわ[0x0]), (てせ = -つわ[0x1]));
                for (その = つわ[0x0]; その < しほ; その++) {
                    var さて = えた.indexOf(たつ[その]);
                    if (さて === -つわ[0x1])
                        continue;
                    if (てせ < つわ[0x0]) {
                        てせ = さて;
                    }
                    else {
                        ゆん((てせ += さて * つわ[0xc]), (おろ |= てせ << ねち), (ねち +=
                            (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(たね.push(おろ & つわ[0x3]), (おろ >>= つわ[0x2]), (ねち -= つわ[0x2]));
                        } while (ねち > つわ[0x9]);
                        てせ = -つわ[0x1];
                    }
                }
                if (てせ > -つわ[0x1]) {
                    たね.push((おろ | (てせ << ねち)) & つわ[0x3]);
                }
                return ちや(たね);
            }
            function えた(えた) {
                if (typeof ひし[えた] === つわ[0x5]) {
                    return (ひし[えた] = いち(をひ[えた]));
                }
                return ひし[えた];
            }
            ねち[おろ(つわ[0x26])]({ [えた(つわ[0x25])]: たね }, えた(0xcb));
            const { [えた(0xcc)]: たつ, [えた(0xcd)]: しほ } = await (0, Utils_1.getNextPreKeysNode)({ [えた(0xce)]: ぬな, [えた(0xcf)]: ゆる }, たね);
            ゆん(await いし(しほ), ゆう[えた(0xd0)](えた(0xd1), たつ), ねち[えた(0xd2)]({ [えた(つわ[0x25])]: たね }, えた(0xd3)));
        });
    }, んち = async () => {
        const たね = await のひ();
        ねち[おろ(つわ[0x26])]("" + たね + おろ(0xd4));
        if (たね <= Defaults_1.MIN_PREKEY_COUNT) {
            function いち(たね) {
                var いち = 'pDZbP(GE0:lRh>se8dVuYi@JF_1BCK%<W5o4!A$S`U#nLN^[;Xav=ryw"/zgQI|6Hq*}T]tM+)?mkO,jxf{372&c9.~', えた, たつ, おろ, ねち, しほ, てせ, その;
                ゆん((えた = "" + (たね || "")), (たつ = えた.length), (おろ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
                for (その = つわ[0x0]; その < たつ; その++) {
                    var さて = いち.indexOf(えた[その]);
                    if (さて === -つわ[0x1])
                        continue;
                    if (てせ < つわ[0x0]) {
                        てせ = さて;
                    }
                    else {
                        ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ +=
                            (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(おろ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                        } while (しほ > つわ[0x9]);
                        てせ = -つわ[0x1];
                    }
                }
                if (てせ > -つわ[0x1]) {
                    おろ.push((ねち | (てせ << しほ)) & つわ[0x3]);
                }
                return ちや(おろ);
            }
            function えた(たね) {
                if (typeof ひし[たね] === つわ[0x5]) {
                    return (ひし[たね] = いち(をひ[たね]));
                }
                return ひし[たね];
            }
            if (えた(0xd5) in よな) {
                たつ();
            }
            function たつ() {
                var たね = function (たね) {
                    var えた = [];
                    if (たね === つわ[0x1] || たね >= つわ[0x5a])
                        いち(えた, [], たね, つわ[0x0]);
                    return えた;
                }, いち, えた, たつ;
                ゆん((いち = function (たね, おろ, ねち, しほ) {
                    var てせ;
                    for (てせ = しほ; てせ < ねち; てせ++) {
                        var その;
                        if (おろ.length !== てせ)
                            return;
                        for (その = つわ[0x0]; その < ねち; その++)
                            if (たつ(おろ, [てせ, その])) {
                                ゆん(おろ.push([てせ, その]), いち(たね, おろ, ねち, てせ + つわ[0x1]));
                                if (おろ.length === ねち)
                                    たね.push(えた(おろ));
                                おろ.pop();
                            }
                    }
                }), (えた = function (たね) {
                    var いち = [], えた, たつ;
                    えた = たね.length;
                    for (たつ = つわ[0x0]; たつ < えた; たつ++) {
                        var おろ;
                        いち[たつ] = "";
                        for (おろ = つわ[0x0]; おろ < えた; おろ++)
                            いち[たつ] +=
                                たね[たつ][つわ[0x1]] === おろ ? つわ[0x5b] : つわ[0x5c];
                    }
                    return いち;
                }), (たつ = function (たね, いち) {
                    var えた = たね.length, たつ;
                    for (たつ = つわ[0x0]; たつ < えた; たつ++) {
                        if (たね[たつ][つわ[0x0]] === いち[つわ[0x0]] ||
                            たね[たつ][つわ[0x1]] === いち[つわ[0x1]])
                            return つわ[0x15];
                        if (Math.abs((たね[たつ][つわ[0x0]] - いち[つわ[0x0]]) /
                            (たね[たつ][つわ[0x1]] - いち[つわ[0x1]])) === つわ[0x1])
                            return つわ[0x15];
                    }
                    return つわ[0x2f];
                }), console.log(たね));
            }
            await こけ();
        }
    }, のち = (たね) => {
        function いち(たね) {
            var いち = 'x~{v$:u_!IGNh6|T3tyV&=j8*LKBXQ/na(do;AP<#k?,HJSs5Dr7Zq1zgUY0.+O[R)lmwEe2cb%C^>]9`}4F"MiW@pf', おろ, えた, たつ, ねち, しほ, てせ, その;
            ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (たつ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < えた; その++) {
                var さて = いち.indexOf(おろ[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(たつ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                    } while (しほ > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                たつ.push((ねち | (てせ << しほ)) & つわ[0x3]);
            }
            return ちや(たつ);
        }
        function おろ(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = いち(をひ[たね]));
            }
            return ひし[たね];
        }
        わい[おろ(0xd6)](たね, (たね) => {
            var _a;
            あそ = new Date();
            let いち = つわ[0x15];
            いち = あは[おろ(0xd7)](おろ(0xd8), たね);
            if (!(たね instanceof Uint8Array)) {
                function えた(たね) {
                    var いち = 'buJOQElTVqCF/a7Yw:[]9v}&x$k{`m.c4h+tI56zWfK2e>3gN,_RB!H80sM#)"jZP%dry1n*(UDApXG~LioS|?^<;@=', えた, たつ, しほ, てせ, その, さて, えあ;
                    ゆん((えた = "" + (たね || "")), (たつ = えた.length), (しほ = []), (てせ = つわ[0x0]), (その = つわ[0x0]), (さて = -つわ[0x1]));
                    for (えあ = つわ[0x0]; えあ < たつ; えあ++) {
                        var makeSocket = いち.indexOf(えた[えあ]);
                        if (makeSocket === -つわ[0x1])
                            continue;
                        if (さて < つわ[0x0]) {
                            さて = makeSocket;
                        }
                        else {
                            ゆん((さて += makeSocket * つわ[0xc]), (てせ |= さて << その), (その +=
                                (さて & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                            do {
                                ゆん(しほ.push(てせ & つわ[0x3]), (てせ >>= つわ[0x2]), (その -= つわ[0x2]));
                            } while (その > つわ[0x9]);
                            さて = -つわ[0x1];
                        }
                    }
                    if (さて > -つわ[0x1]) {
                        しほ.push((てせ | (さて << その)) & つわ[0x3]);
                    }
                    return ちや(しほ);
                }
                function たつ(たね) {
                    if (typeof ひし[たね] === つわ[0x5]) {
                        return (ひし[たね] = えた(をひ[たね]));
                    }
                    return ひし[たね];
                }
                const しほ = たね[たつ(つわ[0x28])][つわ[0x1b]];
                if (ねち[たつ(つわ[0x2e])] === たつ(0xdb)) {
                    function てせ(たね) {
                        var いち = 'xzTKtnqU_/ia}ZMAlE6S{1<Bs;3pg@)j~*#?o.87F2`e($PJHOm49uhkv]!L|R&V:=+YG[,cyb%"rQX0W^>CNIDwd5f', えた, たつ, しほ, てせ, その, さて, えあ;
                        ゆん((えた = "" + (たね || "")), (たつ = えた.length), (しほ = []), (てせ = つわ[0x0]), (その = つわ[0x0]), (さて = -つわ[0x1]));
                        for (えあ = つわ[0x0]; えあ < たつ; えあ++) {
                            var makeSocket = いち.indexOf(えた[えあ]);
                            if (makeSocket === -つわ[0x1])
                                continue;
                            if (さて < つわ[0x0]) {
                                さて = makeSocket;
                            }
                            else {
                                ゆん((さて += makeSocket * つわ[0xc]), (てせ |= さて << その), (その +=
                                    (さて & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                                do {
                                    ゆん(しほ.push(てせ & つわ[0x3]), (てせ >>= つわ[0x2]), (その -= つわ[0x2]));
                                } while (その > つわ[0x9]);
                                さて = -つわ[0x1];
                            }
                        }
                        if (さて > -つわ[0x1]) {
                            しほ.push((てせ | (さて << その)) & つわ[0x3]);
                        }
                        return ちや(しほ);
                    }
                    function その(たね) {
                        if (typeof ひし[たね] === つわ[0x5]) {
                            return (ひし[たね] = てせ(をひ[たね]));
                        }
                        return ひし[たね];
                    }
                    ねち[その(0xdc)]({
                        [その(0xdd)]: (0, WABinary_1.binaryNodeToString)(たね),
                        [その(0xde)]: その(つわ[0x27]),
                    });
                }
                いち = あは[たつ(つわ[0x2a])]("" + Defaults_1.DEF_TAG_PREFIX + しほ, たね) || いち;
                const さて = たね[たつ(0xe1)], えあ = たね[たつ(つわ[0x28])] || {}, makeSocket = Array[たつ(0xe2)](たね[たつ(つわ[0x29])])
                    ? (_a = たね[たつ(つわ[0x29])][つわ[0x0]]) === null || _a === void 0 ? void 0 : _a.tag
                    : "";
                for (const こせ of Object[たつ(0xe4)](えあ)) {
                    function ふり(たね) {
                        var いち = '$JRCDkqYPMfHQFr(Osa70;WLG[eu`_B3=29o5.@zt~X^]KE|jvy/S:?8)iI!{g+}dm%nAN&hV*><wp4,l"cTZbx1#U6', えた, たつ, しほ, てせ, その, さて, えあ;
                        ゆん((えた = "" + (たね || "")), (たつ = えた.length), (しほ = []), (てせ = つわ[0x0]), (その = つわ[0x0]), (さて = -つわ[0x1]));
                        for (えあ = つわ[0x0]; えあ < たつ; えあ++) {
                            var makeSocket = いち.indexOf(えた[えあ]);
                            if (makeSocket === -つわ[0x1])
                                continue;
                            if (さて < つわ[0x0]) {
                                さて = makeSocket;
                            }
                            else {
                                ゆん((さて += makeSocket * つわ[0xc]), (てせ |= さて << その), (その +=
                                    (さて & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                                do {
                                    ゆん(しほ.push(てせ & つわ[0x3]), (てせ >>= つわ[0x2]), (その -= つわ[0x2]));
                                } while (その > つわ[0x9]);
                                さて = -つわ[0x1];
                            }
                        }
                        if (さて > -つわ[0x1]) {
                            しほ.push((てせ | (さて << その)) & つわ[0x3]);
                        }
                        return ちや(しほ);
                    }
                    function おて(たね) {
                        if (typeof ひし[たね] === つわ[0x5]) {
                            return (ひし[たね] = ふり(をひ[たね]));
                        }
                        return ひし[たね];
                    }
                    ゆん((いち =
                        あは[たつ(つわ[0x2a])]("" +
                            Defaults_1.DEF_CALLBACK_PREFIX +
                            さて +
                            つわ[0x2b] +
                            こせ +
                            つわ[0x2c] +
                            えあ[こせ] +
                            つわ[0x2b] +
                            makeSocket, たね) || いち), (いち =
                        あは[おて(つわ[0x2d])]("" +
                            Defaults_1.DEF_CALLBACK_PREFIX +
                            さて +
                            つわ[0x2b] +
                            こせ +
                            つわ[0x2c] +
                            えあ[こせ], たね) || いち), (いち =
                        あは[おて(つわ[0x2d])]("" + Defaults_1.DEF_CALLBACK_PREFIX + さて + つわ[0x2b] + こせ, たね) || いち));
                }
                ゆん((いち =
                    あは[たつ(つわ[0x2a])]("" + Defaults_1.DEF_CALLBACK_PREFIX + さて + ",," + makeSocket, たね) || いち), (いち = あは[たつ(つわ[0x2a])]("" + Defaults_1.DEF_CALLBACK_PREFIX + さて, たね) || いち));
                if (!いち && ねち[たつ(つわ[0x2e])] === たつ(0xe6)) {
                    function かり(たね) {
                        var いち = 'FNDSJHe53p|g1}ta?I:#dBV!yL0mX,U<u(KAkEz;Tx_YCri=79qv8^Qh%nG]P"o>bf~6.ZlW*$c)M+&j{4sOw[@2`R/', えた, たつ, しほ, てせ, その, さて, えあ;
                        ゆん((えた = "" + (たね || "")), (たつ = えた.length), (しほ = []), (てせ = つわ[0x0]), (その = つわ[0x0]), (さて = -つわ[0x1]));
                        for (えあ = つわ[0x0]; えあ < たつ; えあ++) {
                            var makeSocket = いち.indexOf(えた[えあ]);
                            if (makeSocket === -つわ[0x1])
                                continue;
                            if (さて < つわ[0x0]) {
                                さて = makeSocket;
                            }
                            else {
                                ゆん((さて += makeSocket * つわ[0xc]), (てせ |= さて << その), (その +=
                                    (さて & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                                do {
                                    ゆん(しほ.push(てせ & つわ[0x3]), (てせ >>= つわ[0x2]), (その -= つわ[0x2]));
                                } while (その > つわ[0x9]);
                                さて = -つわ[0x1];
                            }
                        }
                        if (さて > -つわ[0x1]) {
                            しほ.push((てせ | (さて << その)) & つわ[0x3]);
                        }
                        return ちや(しほ);
                    }
                    function をと(たね) {
                        if (typeof ひし[たね] === つわ[0x5]) {
                            return (ひし[たね] = かり(をひ[たね]));
                        }
                        return ひし[たね];
                    }
                    ねち[をと(0xe7)]({
                        [をと(0xe8)]: つわ[0x2f],
                        [をと(0xe9)]: しほ,
                        [をと(0xea)]: つわ[0x15],
                        [をと(0xeb)]: たね,
                    }, をと(0xec));
                }
            }
        });
    }, ねね = (たね) => {
        function いち(たね) {
            var いち = 'Zx<?u%:[SDl^L0Hsy@{`rvBWwoUTXIM$~}keG>.E!q97*8,a/]tJ56ic1|mNh"QP&g;A2Yj)+K3#_nOdFfR4=VCzbp(', えた, たつ, しほ, おろ, ねち, てせ, その;
            ゆん((えた = "" + (たね || "")), (たつ = えた.length), (しほ = []), (おろ = つわ[0x0]), (ねち = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < たつ; その++) {
                var さて = いち.indexOf(えた[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (おろ |= てせ << ねち), (ねち += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(しほ.push(おろ & つわ[0x3]), (おろ >>= つわ[0x2]), (ねち -= つわ[0x2]));
                    } while (ねち > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                しほ.push((おろ | (てせ << ねち)) & つわ[0x3]);
            }
            return ちや(しほ);
        }
        function えた(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = いち(をひ[たね]));
            }
            return ひし[たね];
        }
        if (へさ) {
            ねち[おろ(つわ[0x30])]({ [おろ(つわ[0x30])]: たね === null || たね === void 0 ? void 0 : たね.stack }, おろ(0xee));
            return;
        }
        ゆん((へさ = つわ[0x2f]), ねち[おろ(つわ[0x26])]({ [おろ(つわ[0x30])]: たね === null || たね === void 0 ? void 0 : たね.stack }, たね ? えた(つわ[0x31]) : えた(0xf0)), clearInterval(ゆや), clearTimeout(しち), あは[えた(つわ[0x32])](えた(つわ[0x33])), あは[えた(つわ[0x32])](えた(つわ[0x34])), あは[えた(つわ[0x32])](えた(0xf4)), あは[えた(つわ[0x32])](えた(0xf5)));
        if (!あは[えた(0xf6)] && !あは[えた(0xf7)]) {
            try {
                function たつ(たね) {
                    var いち = '6FAjBstcqNZGrogR0hb$zi?Cykl]W>{E&2nx="%Ka#H(Xw5U.OD~epTm1vPS[,+*74:uJYf3M}9d8`!/QI;LV_)^<@|', えた, たつ, しほ, おろ, ねち, てせ, その;
                    ゆん((えた = "" + (たね || "")), (たつ = えた.length), (しほ = []), (おろ = つわ[0x0]), (ねち = つわ[0x0]), (てせ = -つわ[0x1]));
                    for (その = つわ[0x0]; その < たつ; その++) {
                        var さて = いち.indexOf(えた[その]);
                        if (さて === -つわ[0x1])
                            continue;
                        if (てせ < つわ[0x0]) {
                            てせ = さて;
                        }
                        else {
                            ゆん((てせ += さて * つわ[0xc]), (おろ |= てせ << ねち), (ねち +=
                                (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                            do {
                                ゆん(しほ.push(おろ & つわ[0x3]), (おろ >>= つわ[0x2]), (ねち -= つわ[0x2]));
                            } while (ねち > つわ[0x9]);
                            てせ = -つわ[0x1];
                        }
                    }
                    if (てせ > -つわ[0x1]) {
                        しほ.push((おろ | (てせ << ねち)) & つわ[0x3]);
                    }
                    return ちや(しほ);
                }
                function しほ(たね) {
                    if (typeof ひし[たね] === つわ[0x5]) {
                        return (ひし[たね] = たつ(をひ[たね]));
                    }
                    return ひし[たね];
                }
                あは[しほ(0xf8)]();
            }
            catch (_a) { }
        }
        ゆん(ゆう[えた(0xf9)](えた(つわ[0x35]), {
            [えた(0xfb)]: えた(つわ[0x33]),
            [えた(0xfc)]: { [えた(つわ[0x34])]: たね, [えた(0xfd)]: new Date() },
        }), ゆう[えた(つわ[0x32])](えた(つわ[0x35])));
    }, のや = async () => {
        function たね(たね) {
            var いち = '"qJTVEUnaWoYKg3Dw^eP/Q]`sh:?FX|&8I#@4C{B}1bup5%Nz)AMr(RfjGiS_>cy6.tl02kdO*9m7HZLx=v<,~$!+[;', えた, たつ, ねち, しほ, おろ, てせ, その;
            ゆん((えた = "" + (たね || "")), (たつ = えた.length), (ねち = []), (しほ = つわ[0x0]), (おろ = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < たつ; その++) {
                var さて = いち.indexOf(えた[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (しほ |= てせ << おろ), (おろ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(ねち.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (おろ -= つわ[0x2]));
                    } while (おろ > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                ねち.push((しほ | (てせ << おろ)) & つわ[0x3]);
            }
            return ちや(ねち);
        }
        function いち(いち) {
            if (typeof ひし[いち] === つわ[0x5]) {
                return (ひし[いち] = たね(をひ[いち]));
            }
            return ひし[いち];
        }
        if (あは[おろ(0xfe)]) {
            return;
        }
        if (あは[いち(つわ[0x3])] || あは[いち(0x100)]) {
            function えた(たね) {
                var いち = ',BYan7!)Ny6keGTp#V/~IQA_jdr&Z?H+uXU^{t[WPRh02zS8v@iJ9O:b%M3mEDwf>Cx}=s|]5g1Ko("c;F*L$q`4.<l', えた, たつ, ねち, しほ, おろ, てせ, その;
                ゆん((えた = "" + (たね || "")), (たつ = えた.length), (ねち = []), (しほ = つわ[0x0]), (おろ = つわ[0x0]), (てせ = -つわ[0x1]));
                for (その = つわ[0x0]; その < たつ; その++) {
                    var さて = いち.indexOf(えた[その]);
                    if (さて === -つわ[0x1])
                        continue;
                    if (てせ < つわ[0x0]) {
                        てせ = さて;
                    }
                    else {
                        ゆん((てせ += さて * つわ[0xc]), (しほ |= てせ << おろ), (おろ +=
                            (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(ねち.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (おろ -= つわ[0x2]));
                        } while (おろ > つわ[0x9]);
                        てせ = -つわ[0x1];
                    }
                }
                if (てせ > -つわ[0x1]) {
                    ねち.push((しほ | (てせ << おろ)) & つわ[0x3]);
                }
                return ちや(ねち);
            }
            function たつ(たね) {
                if (typeof ひし[たね] === つわ[0x5]) {
                    return (ひし[たね] = えた(をひ[たね]));
                }
                return ひし[たね];
            }
            throw new boom_1.Boom(いち(0x101), { [たつ(0x102)]: Types_1.DisconnectReason[たつ(0x103)] });
        }
        let ねち, しほ;
        await new Promise((たね, えた) => {
            ゆん((ねち = () => {
                return たね(つわ[0x55]);
            }), (しほ = はて(えた)), あは[つわ[0x18]](いち(0x104), ねち), あは[つわ[0x18]](いち(0x105), しほ), あは[つわ[0x18]](いち(0x106), しほ));
        })[いち(0x107)](() => {
            function たね(たね) {
                var えた = 'mRhAfbDL3<lqUEZ0>%JM1^BYCPI5?/aeGWsjSr](V$Tv}gzid[Nk,cot9OQpnx{.XHF;y&:_8!+#`@*u|w)=~42K"67', いち, たつ, ねち, しほ, おろ, てせ, その;
                ゆん((いち = "" + (たね || "")), (たつ = いち.length), (ねち = []), (しほ = つわ[0x0]), (おろ = つわ[0x0]), (てせ = -つわ[0x1]));
                for (その = つわ[0x0]; その < たつ; その++) {
                    var さて = えた.indexOf(いち[その]);
                    if (さて === -つわ[0x1])
                        continue;
                    if (てせ < つわ[0x0]) {
                        てせ = さて;
                    }
                    else {
                        ゆん((てせ += さて * つわ[0xc]), (しほ |= てせ << おろ), (おろ +=
                            (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(ねち.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (おろ -= つわ[0x2]));
                        } while (おろ > つわ[0x9]);
                        てせ = -つわ[0x1];
                    }
                }
                if (てせ > -つわ[0x1]) {
                    ねち.push((しほ | (てせ << おろ)) & つわ[0x3]);
                }
                return ちや(ねち);
            }
            function えた(えた) {
                if (typeof ひし[えた] === つわ[0x5]) {
                    return (ひし[えた] = たね(をひ[えた]));
                }
                return ひし[えた];
            }
            ゆん(あは[いち(0x108)](えた(0x109), ねち), あは[えた(つわ[0x36])](えた(0x10b), しほ), あは[えた(つわ[0x36])](えた(0x10c), しほ));
        });
    }, あよ = () => {
        return (ゆや = setInterval(() => {
            if (!あそ) {
                あそ = new Date();
            }
            const たね = Date[おろ(0x10d)]() - あそ[おろ(0x10e)]();
            if (たね > しほ + 0x1388) {
                function いち(たね) {
                    var いち = 'p1oAMBmYcisdULEgZPDONH{K0!7u<*",b}|5/=qzhCRtX?exS9QTkn;:Wa][F%lvf(r@2yj`#^)w4.I_3&>~6V$8+JG', えた, たつ, てせ, その, さて, おろ, ねち;
                    ゆん((えた = "" + (たね || "")), (たつ = えた.length), (てせ = []), (その = つわ[0x0]), (さて = つわ[0x0]), (おろ = -つわ[0x1]));
                    for (ねち = つわ[0x0]; ねち < たつ; ねち++) {
                        var しほ = いち.indexOf(えた[ねち]);
                        if (しほ === -つわ[0x1])
                            continue;
                        if (おろ < つわ[0x0]) {
                            おろ = しほ;
                        }
                        else {
                            ゆん((おろ += しほ * つわ[0xc]), (その |= おろ << さて), (さて +=
                                (おろ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                            do {
                                ゆん(てせ.push(その & つわ[0x3]), (その >>= つわ[0x2]), (さて -= つわ[0x2]));
                            } while (さて > つわ[0x9]);
                            おろ = -つわ[0x1];
                        }
                    }
                    if (おろ > -つわ[0x1]) {
                        てせ.push((その | (おろ << さて)) & つわ[0x3]);
                    }
                    return ちや(てせ);
                }
                function えた(たね) {
                    if (typeof ひし[たね] === つわ[0x5]) {
                        return (ひし[たね] = いち(をひ[たね]));
                    }
                    return ひし[たね];
                }
                ねね(new boom_1.Boom(おろ(0x10f), { [えた(0x110)]: Types_1.DisconnectReason[えた(0x111)] }));
            }
            else {
                function たつ(たね) {
                    var いち = 'frv`4;{1a/3>0<*58[A_}PmB,@$9j]&)sdCN|:!7Uluwx2JYH"G?e^nWDE#bQgiIk%.=LRZhXMzyVOtoFT6~(+cSKqp', えた, たつ, てせ, その, さて, おろ, ねち;
                    ゆん((えた = "" + (たね || "")), (たつ = えた.length), (てせ = []), (その = つわ[0x0]), (さて = つわ[0x0]), (おろ = -つわ[0x1]));
                    for (ねち = つわ[0x0]; ねち < たつ; ねち++) {
                        var しほ = いち.indexOf(えた[ねち]);
                        if (しほ === -つわ[0x1])
                            continue;
                        if (おろ < つわ[0x0]) {
                            おろ = しほ;
                        }
                        else {
                            ゆん((おろ += しほ * つわ[0xc]), (その |= おろ << さて), (さて +=
                                (おろ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                            do {
                                ゆん(てせ.push(その & つわ[0x3]), (その >>= つわ[0x2]), (さて -= つわ[0x2]));
                            } while (さて > つわ[0x9]);
                            おろ = -つわ[0x1];
                        }
                    }
                    if (おろ > -つわ[0x1]) {
                        てせ.push((その | (おろ << さて)) & つわ[0x3]);
                    }
                    return ちや(てせ);
                }
                function てせ(たね) {
                    if (typeof ひし[たね] === つわ[0x5]) {
                        return (ひし[たね] = たつ(をひ[たね]));
                    }
                    return ひし[たね];
                }
                if (あは[てせ(0x112)]) {
                    function その(たね) {
                        var いち = '6eRD%4N[${IubfA`|Sg@._Tov#HE=7t1n+~Zm];Y(QVX,3yMBW}9C8xP/<iKz*h2F:JrqksOw!&0?dlUL)jGap>c5^"', えた, たつ, てせ, その, さて, おろ, ねち;
                        ゆん((えた = "" + (たね || "")), (たつ = えた.length), (てせ = []), (その = つわ[0x0]), (さて = つわ[0x0]), (おろ = -つわ[0x1]));
                        for (ねち = つわ[0x0]; ねち < たつ; ねち++) {
                            var しほ = いち.indexOf(えた[ねち]);
                            if (しほ === -つわ[0x1])
                                continue;
                            if (おろ < つわ[0x0]) {
                                おろ = しほ;
                            }
                            else {
                                ゆん((おろ += しほ * つわ[0xc]), (その |= おろ << さて), (さて +=
                                    (おろ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                                do {
                                    ゆん(てせ.push(その & つわ[0x3]), (その >>= つわ[0x2]), (さて -= つわ[0x2]));
                                } while (さて > つわ[0x9]);
                                おろ = -つわ[0x1];
                            }
                        }
                        if (おろ > -つわ[0x1]) {
                            てせ.push((その | (おろ << さて)) & つわ[0x3]);
                        }
                        return ちや(てせ);
                    }
                    function さて(たね) {
                        if (typeof ひし[たね] === つわ[0x5]) {
                            return (ひし[たね] = その(をひ[たね]));
                        }
                        return ひし[たね];
                    }
                    いし({
                        [てせ(0x113)]: つわ[0x37],
                        [さて(つわ[0x39])]: {
                            [つわ[0x1b]]: つう(),
                            [つわ[0x38]]: WABinary_1.S_WHATSAPP_NET,
                            [さて(0x115)]: さて(0x116),
                            [さて(0x117)]: さて(0x118),
                        },
                        [さて(0x119)]: [
                            { [さて(0x11a)]: さて(0x11b), [さて(つわ[0x39])]: {} },
                        ],
                    })[さて(0x11c)]((たね) => {
                        function いち(たね) {
                            var いち = 'xkfIYDu;j:d3[q+/0~J_PSv5KWmQz|%@7R469]n.ZyCc$18r2!i^eMb?`wgN(Oh&XTs,"F>Lp)Ua*t}l<HB=AE{o#GV', えた, たつ, てせ, その, さて, おろ, ねち;
                            ゆん((えた = "" + (たね || "")), (たつ = えた.length), (てせ = []), (その = つわ[0x0]), (さて = つわ[0x0]), (おろ = -つわ[0x1]));
                            for (ねち = つわ[0x0]; ねち < たつ; ねち++) {
                                var しほ = いち.indexOf(えた[ねち]);
                                if (しほ === -つわ[0x1])
                                    continue;
                                if (おろ < つわ[0x0]) {
                                    おろ = しほ;
                                }
                                else {
                                    ゆん((おろ += しほ * つわ[0xc]), (その |= おろ << さて), (さて +=
                                        (おろ & つわ[0xd]) > つわ[0xe]
                                            ? つわ[0xf]
                                            : つわ[0x10]));
                                    do {
                                        ゆん(てせ.push(その & つわ[0x3]), (その >>= つわ[0x2]), (さて -= つわ[0x2]));
                                    } while (さて > つわ[0x9]);
                                    おろ = -つわ[0x1];
                                }
                            }
                            if (おろ > -つわ[0x1]) {
                                てせ.push((その | (おろ << さて)) & つわ[0x3]);
                            }
                            return ちや(てせ);
                        }
                        function えた(たね) {
                            if (typeof ひし[たね] === つわ[0x5]) {
                                return (ひし[たね] = いち(をひ[たね]));
                            }
                            return ひし[たね];
                        }
                        ねち[さて(0x11d)]({ [さて(0x11e)]: たね[さて(0x11f)] }, えた(0x120));
                    });
                }
                else {
                    ねち[てせ(0x121)](てせ(0x122));
                }
            }
        }, しほ));
    }, てお = (たね) => {
        function いち(たね) {
            var いち = ':NRjOodGhSTpZKXJPYfVLQqx#tr=uWsC3$*_aEy0e>"Un4b,lHFB<2%v.gD}wI6c7`1m&^A|!+?z[)ik(;5M8]/9~{@', おろ, えた, たつ, ねち, しほ, てせ, その;
            ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (たつ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < えた; その++) {
                var さて = いち.indexOf(おろ[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(たつ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                    } while (しほ > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                たつ.push((ねち | (てせ << しほ)) & つわ[0x3]);
            }
            return ちや(たつ);
        }
        function おろ(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = いち(をひ[たね]));
            }
            return ひし[たね];
        }
        return いし({
            [おろ(つわ[0x3a])]: つわ[0x37],
            [おろ(つわ[0x3b])]: {
                [つわ[0x38]]: WABinary_1.S_WHATSAPP_NET,
                [おろ(0x125)]: おろ(0x126),
                [おろ(0x127)]: おろ(0x128),
            },
            [おろ(0x129)]: [{ [おろ(つわ[0x3a])]: たね, [おろ(つわ[0x3b])]: {} }],
        });
    }, ひち = async (たね) => {
        var _a;
        const いち = (_a = その[おろ(つわ[0x13])][つわ[0x1e]]) === null || _a === void 0 ? void 0 : _a.id;
        if (いち) {
            function えた(たね) {
                var いち = 'EAqjKrGdYLZnpSHTbsBfaCQNheWJktmMIlD3F^{o(OUc6gP.VRi28@z=_+y,v49<`:}?/x)0u~5&"]*[w#$|1>7;%!X', えた, たつ, おろ, ねち, しほ, てせ, その;
                ゆん((えた = "" + (たね || "")), (たつ = えた.length), (おろ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
                for (その = つわ[0x0]; その < たつ; その++) {
                    var さて = いち.indexOf(えた[その]);
                    if (さて === -つわ[0x1])
                        continue;
                    if (てせ < つわ[0x0]) {
                        てせ = さて;
                    }
                    else {
                        ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ +=
                            (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(おろ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                        } while (しほ > つわ[0x9]);
                        てせ = -つわ[0x1];
                    }
                }
                if (てせ > -つわ[0x1]) {
                    おろ.push((ねち | (てせ << しほ)) & つわ[0x3]);
                }
                return ちや(おろ);
            }
            function たつ(たね) {
                if (typeof ひし[たね] === つわ[0x5]) {
                    return (ひし[たね] = えた(をひ[たね]));
                }
                return ひし[たね];
            }
            await よて({
                [おろ(つわ[0x46])]: つわ[0x37],
                [おろ(つわ[0x4c])]: {
                    [つわ[0x38]]: WABinary_1.S_WHATSAPP_NET,
                    [おろ(つわ[0x4d])]: たつ(0x12d),
                    [つわ[0x1b]]: つう(),
                    [たつ(0x12e)]: つわ[0x3e],
                },
                [たつ(0x12f)]: [
                    {
                        [たつ(0x130)]: たつ(0x131),
                        [たつ(0x132)]: {
                            [たつ(0x133)]: いち,
                            [たつ(0x134)]: たつ(0x135),
                        },
                    },
                ],
            });
        }
        ねね(new boom_1.Boom(たね || おろ(0x136), {
            [おろ(つわ[0x3c])]: Types_1.DisconnectReason[おろ(0x137)],
        }));
    }, ちほ = async (たね) => {
        var _a;
        function いち(たね) {
            var いち = 'G3`uvDg/O}eXN&V5ltp?S;iRq[s{@k:I!Lb~="HQdY1A9#*c.w+$rxPMm_2C(j>^|,J4EKh6B8TZ7yWoazfU]n)0<%F', えた, おろ, たつ, ねち, しほ, てせ, その;
            ゆん((えた = "" + (たね || "")), (おろ = えた.length), (たつ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < おろ; その++) {
                var さて = いち.indexOf(えた[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(たつ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                    } while (しほ > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                たつ.push((ねち | (てせ << しほ)) & つわ[0x3]);
            }
            return ちや(たつ);
        }
        function えた(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = いち(をひ[たね]));
            }
            return ひし[たね];
        }
        ゆん((その[おろ(つわ[0x13])][えた(つわ[0x42])] =
            ((_a = おて === null || おて === void 0 ? void 0 : おて.toLocaleUpperCase) === null || _a === void 0 ? void 0 : _a.call(おて)) || (0, Utils_1.bytesToCrockford)((0, crypto_1.randomBytes)(0x5))), (その[えた(つわ[0x3d])][つわ[0x1e]] = {
            [つわ[0x1b]]: (0, WABinary_1.jidEncode)(たね, えた(0x13a)),
            [えた(0x13b)]: "~",
        }), ゆう[えた(0x13c)](えた(0x13d), その[えた(つわ[0x3d])]), await よて({
            [えた(つわ[0x3f])]: つわ[0x37],
            [えた(つわ[0x40])]: {
                [つわ[0x38]]: WABinary_1.S_WHATSAPP_NET,
                [えた(0x140)]: えた(0x141),
                [つわ[0x1b]]: つう(),
                [えた(0x142)]: つわ[0x3e],
            },
            [えた(つわ[0x41])]: [
                {
                    [えた(つわ[0x3f])]: えた(0x144),
                    [えた(つわ[0x40])]: {
                        [えた(0x145)]: その[えた(つわ[0x3d])][つわ[0x1e]][つわ[0x1b]],
                        [えた(0x146)]: えた(0x147),
                        [えた(0x148)]: えた(0x149),
                    },
                    [えた(つわ[0x41])]: [
                        {
                            [えた(つわ[0x3f])]: えた(0x14a),
                            [えた(つわ[0x40])]: {},
                            [えた(つわ[0x41])]: await てさ(),
                        },
                        {
                            [えた(つわ[0x3f])]: えた(0x14b),
                            [えた(つわ[0x40])]: {},
                            [えた(つわ[0x41])]: その[えた(つわ[0x3d])][えた(0x14c)][えた(0x14d)],
                        },
                        {
                            [えた(つわ[0x3f])]: えた(0x14e),
                            [えた(つわ[0x40])]: {},
                            [えた(つわ[0x41])]: (0, Utils_1.getPlatformId)(てせ[つわ[0x1]]),
                        },
                        {
                            [えた(つわ[0x3f])]: えた(0x14f),
                            [えた(つわ[0x40])]: {},
                            [えた(つわ[0x41])]: "" + てせ[つわ[0x1]] + " (" + てせ[つわ[0x0]] + つわ[0x61],
                        },
                        {
                            [えた(つわ[0x3f])]: えた(0x150),
                            [えた(つわ[0x40])]: {},
                            [えた(つわ[0x41])]: "0",
                        },
                    ],
                },
            ],
        }));
        return その[えた(つわ[0x3d])][えた(つわ[0x42])];
    };
    async function てさ(たね, いち) {
        if (!いち) {
            いち = function (いち) {
                if (typeof ひし[いち] === つわ[0x5]) {
                    return (ひし[いち] = たね(をひ[いち]));
                }
                return ひし[いち];
            };
        }
        if (!たね) {
            たね = function (たね) {
                var いち = 'T3qNkDOoBlLEGbanpU5Y~A|e&X1vWg0C94!%RMVF8j?`"*#/fi.=d72t)c$Hx;u]Jh<rKPSI:_z+sm@^QZ{(},wy[6>', えた, たつ, ねち, しほ, おろ, てせ, その;
                ゆん((えた = "" + (たね || "")), (たつ = えた.length), (ねち = []), (しほ = つわ[0x0]), (おろ = つわ[0x0]), (てせ = -つわ[0x1]));
                for (その = つわ[0x0]; その < たつ; その++) {
                    var さて = いち.indexOf(えた[その]);
                    if (さて === -つわ[0x1])
                        continue;
                    if (てせ < つわ[0x0]) {
                        てせ = さて;
                    }
                    else {
                        ゆん((てせ += さて * つわ[0xc]), (しほ |= てせ << おろ), (おろ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(ねち.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (おろ -= つわ[0x2]));
                        } while (おろ > つわ[0x9]);
                        てせ = -つわ[0x1];
                    }
                }
                if (てせ > -つわ[0x1]) {
                    ねち.push((しほ | (てせ << おろ)) & つわ[0x3]);
                }
                return ちや(ねち);
            };
        }
        const えた = (0, crypto_1.randomBytes)(0x20), たつ = (0, crypto_1.randomBytes)(0x10), ねち = await (0, Utils_1.derivePairingCodeKey)(その[おろ(つわ[0x13])][おろ(0x151)], えた), しほ = (0, Utils_1.aesEncryptCTR)(その[おろ(つわ[0x13])][おろ(0x152)][おろ(0x153)], ねち, たつ);
        return Buffer[いち(0x154)]([えた, たつ, しほ]);
    }
    async function えら(たね, いち, えた) {
        var _a;
        if (!えた) {
            えた = function (たね) {
                if (typeof ひし[たね] === つわ[0x5]) {
                    return (ひし[たね] = いち(をひ[たね]));
                }
                return ひし[たね];
            };
        }
        if (!いち) {
            いち = function (たね) {
                var いち = '2fPHXWAjUmaIiQDlFV;Y%76`rw$od)K~:.#ztn@,8[qB34>&EZThNk!sv|L<yOe?GCg/xJ]{(cSb9Ru^+pM150*_"}=', えた, たつ, ねち, しほ, てせ, おろ, その;
                ゆん((えた = "" + (たね || "")), (たつ = えた.length), (ねち = []), (しほ = つわ[0x0]), (てせ = つわ[0x0]), (おろ = -つわ[0x1]));
                for (その = つわ[0x0]; その < たつ; その++) {
                    var さて = いち.indexOf(えた[その]);
                    if (さて === -つわ[0x1])
                        continue;
                    if (おろ < つわ[0x0]) {
                        おろ = さて;
                    }
                    else {
                        ゆん((おろ += さて * つわ[0xc]), (しほ |= おろ << てせ), (てせ += (おろ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(ねち.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (てせ -= つわ[0x2]));
                        } while (てせ > つわ[0x9]);
                        おろ = -つわ[0x1];
                    }
                }
                if (おろ > -つわ[0x1]) {
                    ねち.push((しほ | (おろ << てせ)) & つわ[0x3]);
                }
                return ちや(ねち);
            };
        }
        if (!((_a = たね === null || たね === void 0 ? void 0 : たね.creds) === null || _a === void 0 ? void 0 : _a.me)) {
            if (おろ(0x155) in よな) {
                たつ();
            }
            function たつ() { }
            return つわ[0x15];
        }
        const ねち = (await Promise.resolve().then(() => __importStar(require("https"))))[えた(0x158)], しほ = Buffer[えた(0x159)](えた(0x15a), えた(0x15b))[えた(0x15c)](えた(0x15d)), てせ = await new Promise((いち, たつ) => {
            ねち[えた(0x15e)](しほ, (ねち) => {
                function しほ(ねち) {
                    var しほ = 'lOuw6:,|/531*>H7p&<s2)iKXYT#ZUIdhG^P}e9Qf8qRVS@F;JngkE_.D!~0WczCj[]v`4rMNym{L"$bB(ao+t=A?x%', てせ, おろ, いち, たつ, たね, えた, その;
                    ゆん((てせ = "" + (ねち || "")), (おろ = てせ.length), (いち = []), (たつ = つわ[0x0]), (たね = つわ[0x0]), (えた = -つわ[0x1]));
                    for (その = つわ[0x0]; その < おろ; その++) {
                        var さて = しほ.indexOf(てせ[その]);
                        if (さて === -つわ[0x1])
                            continue;
                        if (えた < つわ[0x0]) {
                            えた = さて;
                        }
                        else {
                            ゆん((えた += さて * つわ[0xc]), (たつ |= えた << たね), (たね +=
                                (えた & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                            do {
                                ゆん(いち.push(たつ & つわ[0x3]), (たつ >>= つわ[0x2]), (たね -= つわ[0x2]));
                            } while (たね > つわ[0x9]);
                            えた = -つわ[0x1];
                        }
                    }
                    if (えた > -つわ[0x1]) {
                        いち.push((たつ | (えた << たね)) & つわ[0x3]);
                    }
                    return ちや(いち);
                }
                function てせ(ねち) {
                    if (typeof ひし[ねち] === つわ[0x5]) {
                        return (ひし[ねち] = しほ(をひ[ねち]));
                    }
                    return ひし[ねち];
                }
                if (ねち[えた(つわ[0x45])] !== つわ[0x44]) {
                    return たつ(えた(0x160) + ねち[えた(つわ[0x45])]);
                }
                let おろ = "";
                ねち[えた(0x161)](てせ(0x162))[つわ[0x18]](てせ(0x163), (ねち) => {
                    return (おろ += ねち);
                })[つわ[0x18]](てせ(0x164), () => {
                    var _a, _b, _c;
                    いち(new RegExp((_c = (0, WABinary_1.jidDecode)((_b = (_a = たね === null || たね === void 0 ? void 0 : たね.creds) === null || _a === void 0 ? void 0 : _a.me) === null || _b === void 0 ? void 0 : _b.id)) === null || _c === void 0 ? void 0 : _c.user, "i")[てせ(0x165)](おろ[てせ(0x166)]()));
                });
            })[つわ[0x18]](えた(0x167), () => {
                return たつ(えた(0x168));
            });
        });
        return てせ;
    }
    const きな = (たね) => {
        function いち(たね) {
            var いち = 'Z;)82?![uL&<AQ%3cR^h]s1vFbJ4No6:aTgYz~V,SE$XDwO(+y>ilrte_/mBWjf"n7q0PpHMkd@|=C{I*UK}G.9x`#5', えた, おろ, たつ, ねち, しほ, てせ, その;
            ゆん((えた = "" + (たね || "")), (おろ = えた.length), (たつ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < おろ; その++) {
                var さて = いち.indexOf(えた[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(たつ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                    } while (しほ > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                たつ.push((ねち | (てせ << しほ)) & つわ[0x3]);
            }
            return ちや(たつ);
        }
        function えた(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = いち(をひ[たね]));
            }
            return ひし[たね];
        }
        return いし({
            [おろ(つわ[0x46])]: つわ[0x37],
            [えた(つわ[0x47])]: {
                [つわ[0x38]]: WABinary_1.S_WHATSAPP_NET,
                [つわ[0x1b]]: つう(),
                [えた(0x16a)]: えた(0x16b),
            },
            [えた(つわ[0x48])]: [
                {
                    [えた(0x16d)]: えた(0x16e),
                    [えた(つわ[0x47])]: {},
                    [えた(つわ[0x48])]: たね,
                },
            ],
        });
    };
    ゆん(あは[つわ[0x18]](おろ(0x16f), のち), あは[つわ[0x18]](おろ(0x170), async () => {
        try {
            await ひせ();
        }
        catch (たね) {
            ゆん(ねち[おろ(つわ[0x49])]({ [おろ(0x171)]: たね }, おろ(0x172)), ねね(たね));
        }
    }), あは[つわ[0x18]](おろ(つわ[0x49]), はて(ねね)), あは[つわ[0x18]](おろ(つわ[0x4a]), () => {
        return ねね(new boom_1.Boom(おろ(0x173), { [おろ(つわ[0x3c])]: Types_1.DisconnectReason[おろ(つわ[0x4b])] }));
    }), あは[つわ[0x18]](おろ(0x174), () => {
        return ねね(new boom_1.Boom(おろ(0x175), { [おろ(つわ[0x3c])]: Types_1.DisconnectReason[おろ(つわ[0x4b])] }));
    }), あは[つわ[0x18]](おろ(0x176), async (たね) => {
        function いち(たね) {
            var いち = 'YA^!m+e=06np;gN.Ru|}Mv#TX2{t1O7[*_:"(><)?4w5%x]z3$~Fy/d`&o89VU,fWZjBbPqlCrKEDIkLGQasiHcSJh@', えた, たつ, ねち, しほ, てせ, その, さて;
            ゆん((えた = "" + (たね || "")), (たつ = えた.length), (ねち = []), (しほ = つわ[0x0]), (てせ = つわ[0x0]), (その = -つわ[0x1]));
            for (さて = つわ[0x0]; さて < たつ; さて++) {
                var えあ = いち.indexOf(えた[さて]);
                if (えあ === -つわ[0x1])
                    continue;
                if (その < つわ[0x0]) {
                    その = えあ;
                }
                else {
                    ゆん((その += えあ * つわ[0xc]), (しほ |= その << てせ), (てせ += (その & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(ねち.push(しほ & つわ[0x3]), (しほ >>= つわ[0x2]), (てせ -= つわ[0x2]));
                    } while (てせ > つわ[0x9]);
                    その = -つわ[0x1];
                }
            }
            if (その > -つわ[0x1]) {
                ねち.push((しほ | (その << てせ)) & つわ[0x3]);
            }
            return ちや(ねち);
        }
        function えた(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = いち(をひ[たね]));
            }
            return ひし[たね];
        }
        const たつ = {
            [おろ(つわ[0x46])]: つわ[0x37],
            [おろ(つわ[0x4c])]: {
                [つわ[0x38]]: WABinary_1.S_WHATSAPP_NET,
                [おろ(つわ[0x4d])]: おろ(0x177),
                [つわ[0x1b]]: たね[おろ(つわ[0x4c])][つわ[0x1b]],
            },
        };
        await よて(たつ);
        const ねち = (0, WABinary_1.getBinaryNodeChild)(たね, えた(0x178)), しほ = (0, WABinary_1.getBinaryNodeChildren)(ねち, えた(0x179)), てせ = Buffer[えた(つわ[0x4e])](ぬな[えた(0x17b)][えた(つわ[0x4f])])[えた(つわ[0x50])](えた(つわ[0x51])), その = Buffer[えた(つわ[0x4e])](ぬな[えた(0x17f)][えた(つわ[0x4f])])[えた(つわ[0x50])](えた(つわ[0x51])), さて = ぬな[えた(0x180)];
        let えあ = こせ || 0xea60;
        const makeSocket = () => {
            function たね(たね) {
                var いち = 'c2Ou/v:h"lTEw=Z{LNXftVI9nJ0k>D?58$d%P)prMH~]@iYx7|4+.}bg#!e*q&BzjFsRQKaW_,6^31;[<(`GAUmySoC', たつ, ねち, おろ, ふり, おて, えた, しほ;
                ゆん((たつ = "" + (たね || "")), (ねち = たつ.length), (おろ = []), (ふり = つわ[0x0]), (おて = つわ[0x0]), (えた = -つわ[0x1]));
                for (しほ = つわ[0x0]; しほ < ねち; しほ++) {
                    var てせ = いち.indexOf(たつ[しほ]);
                    if (てせ === -つわ[0x1])
                        continue;
                    if (えた < つわ[0x0]) {
                        えた = てせ;
                    }
                    else {
                        ゆん((えた += てせ * つわ[0xc]), (ふり |= えた << おて), (おて +=
                            (えた & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(おろ.push(ふり & つわ[0x3]), (ふり >>= つわ[0x2]), (おて -= つわ[0x2]));
                        } while (おて > つわ[0x9]);
                        えた = -つわ[0x1];
                    }
                }
                if (えた > -つわ[0x1]) {
                    おろ.push((ふり | (えた << おて)) & つわ[0x3]);
                }
                return ちや(おろ);
            }
            function いち(いち) {
                if (typeof ひし[いち] === つわ[0x5]) {
                    return (ひし[いち] = たね(をひ[いち]));
                }
                return ひし[いち];
            }
            if (!あは[えた(0x181)]) {
                return;
            }
            const たつ = しほ[いち(0x182)]();
            if (!たつ) {
                function ねち(たね) {
                    var いち = 'F,6^?7hSasg<r0Tu;l~|"81v=$Q@(4N]R[}5:YpC_d#z>`oI9BcUyxJbmMG!PX+i.nfO%3Hqk*KjAVEDW&t{e2L)Z/w', たつ, ねち, おろ, ふり, おて, えた, しほ;
                    ゆん((たつ = "" + (たね || "")), (ねち = たつ.length), (おろ = []), (ふり = つわ[0x0]), (おて = つわ[0x0]), (えた = -つわ[0x1]));
                    for (しほ = つわ[0x0]; しほ < ねち; しほ++) {
                        var てせ = いち.indexOf(たつ[しほ]);
                        if (てせ === -つわ[0x1])
                            continue;
                        if (えた < つわ[0x0]) {
                            えた = てせ;
                        }
                        else {
                            ゆん((えた += てせ * つわ[0xc]), (ふり |= えた << おて), (おて +=
                                (えた & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                            do {
                                ゆん(おろ.push(ふり & つわ[0x3]), (ふり >>= つわ[0x2]), (おて -= つわ[0x2]));
                            } while (おて > つわ[0x9]);
                            えた = -つわ[0x1];
                        }
                    }
                    if (えた > -つわ[0x1]) {
                        おろ.push((ふり | (えた << おて)) & つわ[0x3]);
                    }
                    return ちや(おろ);
                }
                function おろ(たね) {
                    if (typeof ひし[たね] === つわ[0x5]) {
                        return (ひし[たね] = ねち(をひ[たね]));
                    }
                    return ひし[たね];
                }
                ねね(new boom_1.Boom(いち(0x183), { [いち(0x184)]: Types_1.DisconnectReason[おろ(0x185)] }));
                return;
            }
            const ふり = たつ[いち(0x186)][いち(0x187)](いち(0x188)), おて = [ふり, てせ, その, さて][いち(0x189)](つわ[0x2b]);
            ゆん(ゆう[いち(0x18a)](いち(0x18b), { [つわ[0x54]]: おて }), (しち = setTimeout(makeSocket, えあ)), (えあ = こせ || 0x4e20));
        };
        makeSocket();
    }), あは[つわ[0x18]](おろ(0x18c), async (たね) => {
        ねち[おろ(0x18d)](おろ(0x18e));
        try {
            function いち(たね) {
                var いち = 'wDRChvk@MJV67Y;(^5Ho*)eOEBUApb2F_},lL8gQZPu&]G/nq~{:4>d`=i[1WsrTN+|tafcz<SK#m%I?xj.9X!$y"30', えた, たつ, しほ, てせ, その, おろ, ねち;
                ゆん((えた = "" + (たね || "")), (たつ = えた.length), (しほ = []), (てせ = つわ[0x0]), (その = つわ[0x0]), (おろ = -つわ[0x1]));
                for (ねち = つわ[0x0]; ねち < たつ; ねち++) {
                    var さて = いち.indexOf(えた[ねち]);
                    if (さて === -つわ[0x1])
                        continue;
                    if (おろ < つわ[0x0]) {
                        おろ = さて;
                    }
                    else {
                        ゆん((おろ += さて * つわ[0xc]), (てせ |= おろ << その), (その +=
                            (おろ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(しほ.push(てせ & つわ[0x3]), (てせ >>= つわ[0x2]), (その -= つわ[0x2]));
                        } while (その > つわ[0x9]);
                        おろ = -つわ[0x1];
                    }
                }
                if (おろ > -つわ[0x1]) {
                    しほ.push((てせ | (おろ << その)) & つわ[0x3]);
                }
                return ちや(しほ);
            }
            function えた(たね) {
                if (typeof ひし[たね] === つわ[0x5]) {
                    return (ひし[たね] = いち(をひ[たね]));
                }
                return ひし[たね];
            }
            if (えた(0x18f) in よな) {
                たつ();
            }
            function たつ() {
                var たね = function (たね) {
                    var いち = たね.length, えた, たつ, しほ, てせ, その, おろ, ねち, さて, えあ, makeSocket;
                    if (いち < 0x2)
                        return つわ[0x0];
                    ゆん((えた = Math.max(...たね)), (たつ = Math.min(...たね)));
                    if (えた === たつ)
                        return つわ[0x0];
                    ゆん((しほ = Array(いち - つわ[0x1]).fill(Number.MAX_SAFE_INTEGER)), (てせ = Array(いち - つわ[0x1]).fill(Number.MIN_SAFE_INTEGER)), (その = Math.ceil((えた - たつ) / (いち - つわ[0x1]))), (おろ = つわ[0x0]));
                    for (ねち = つわ[0x0]; ねち < いち; ねち++) {
                        if (たね[ねち] === たつ || たね[ねち] === えた)
                            continue;
                        ゆん((おろ = Math.floor((たね[ねち] - たつ) / その)), (しほ[おろ] = Math.min(しほ[おろ], たね[ねち])), (てせ[おろ] = Math.max(てせ[おろ], たね[ねち])));
                    }
                    ゆん((さて = Number.MIN_SAFE_INTEGER), (えあ = たつ));
                    for (makeSocket = つわ[0x0]; makeSocket < いち - つわ[0x1]; makeSocket++) {
                        if (しほ[makeSocket] === Number.MAX_SAFE_INTEGER &&
                            てせ[makeSocket] === Number.MIN_SAFE_INTEGER)
                            continue;
                        ゆん((さて = Math.max(さて, しほ[makeSocket] - えあ)), (えあ = てせ[makeSocket]));
                    }
                    さて = Math.max(さて, えた - えあ);
                    return さて;
                };
                console.log(たね);
            }
            const { [えた(0x190)]: しほ, [えた(0x191)]: てせ } = (0, Utils_1.configureSuccessfulPairing)(たね, ぬな);
            ゆん(ねち[えた(0x192)]({
                [つわ[0x1e]]: てせ[つわ[0x1e]],
                [えた(つわ[0x52])]: てせ[えた(つわ[0x52])],
            }, えた(0x194)), ゆう[えた(つわ[0x53])](えた(0x196), てせ), ゆう[えた(つわ[0x53])](えた(0x197), {
                [えた(0x198)]: つわ[0x2f],
                [つわ[0x54]]: つわ[0x55],
            }), await よて(しほ));
        }
        catch (その) {
            ゆん(ねち[おろ(つわ[0x26])]({ [おろ(つわ[0x30])]: その[おろ(0x199)] }, おろ(0x19a)), ねね(その));
        }
    }), あは[つわ[0x18]](おろ(0x19b), async (たね) => {
        var _a, _b, _c;
        try {
            function いち(たね) {
                var いち = '$iHGeSVlRXkrWZgsphCUJBbTctfFo(K^mY1<anED7MvLQqj)I!:yOPNdA2,3>[{8~&9]"z.u%;?|w`6/#}*5+4x=_0@', えた, たつ, しほ, てせ, さて, えあ, makeSocket;
                ゆん((えた = "" + (たね || "")), (たつ = えた.length), (しほ = []), (てせ = つわ[0x0]), (さて = つわ[0x0]), (えあ = -つわ[0x1]));
                for (makeSocket = つわ[0x0]; makeSocket < たつ; makeSocket++) {
                    var おろ = いち.indexOf(えた[makeSocket]);
                    if (おろ === -つわ[0x1])
                        continue;
                    if (えあ < つわ[0x0]) {
                        えあ = おろ;
                    }
                    else {
                        ゆん((えあ += おろ * つわ[0xc]), (てせ |= えあ << さて), (さて +=
                            (えあ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(しほ.push(てせ & つわ[0x3]), (てせ >>= つわ[0x2]), (さて -= つわ[0x2]));
                        } while (さて > つわ[0x9]);
                        えあ = -つわ[0x1];
                    }
                }
                if (えあ > -つわ[0x1]) {
                    しほ.push((てせ | (えあ << さて)) & つわ[0x3]);
                }
                return ちや(しほ);
            }
            function えた(たね) {
                if (typeof ひし[たね] === つわ[0x5]) {
                    return (ひし[たね] = いち(をひ[たね]));
                }
                return ひし[たね];
            }
            const { [おろ(0x19c)]: たつ } = (await Promise.resolve().then(() => __importStar(require("fs"))))[おろ(つわ[0x56])], { [おろ(0x19e)]: しほ } = (await Promise.resolve().then(() => __importStar(require("child_process"))))[おろ(つわ[0x56])];
            ゆん(await んち(), await てお(えた(0x19f)), ねち[えた(0x1a0)](えた(0x1a1)), clearTimeout(しち));
            if (!(await えら(その))) {
                function てせ(たね) {
                    var いち = '&HAmqRSBi[<d6Y5g]8x4QW.@C1k!`hIu$sUyjp)=LX,K;92cV}"vN#r7e|MJzwE^3_n/PoD*FZb~+f>T:0(?t%{GalO', えた, たつ, しほ, てせ, さて, えあ, makeSocket;
                    ゆん((えた = "" + (たね || "")), (たつ = えた.length), (しほ = []), (てせ = つわ[0x0]), (さて = つわ[0x0]), (えあ = -つわ[0x1]));
                    for (makeSocket = つわ[0x0]; makeSocket < たつ; makeSocket++) {
                        var おろ = いち.indexOf(えた[makeSocket]);
                        if (おろ === -つわ[0x1])
                            continue;
                        if (えあ < つわ[0x0]) {
                            えあ = おろ;
                        }
                        else {
                            ゆん((えあ += おろ * つわ[0xc]), (てせ |= えあ << さて), (さて +=
                                (えあ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                            do {
                                ゆん(しほ.push(てせ & つわ[0x3]), (てせ >>= つわ[0x2]), (さて -= つわ[0x2]));
                            } while (さて > つわ[0x9]);
                            えあ = -つわ[0x1];
                        }
                    }
                    if (えあ > -つわ[0x1]) {
                        しほ.push((てせ | (えあ << さて)) & つわ[0x3]);
                    }
                    return ちや(しほ);
                }
                function さて(たね) {
                    if (typeof ひし[たね] === つわ[0x5]) {
                        return (ひし[たね] = てせ(をひ[たね]));
                    }
                    return ひし[たね];
                }
                const えあ = {
                    ...JSON[さて(つわ[0x57])](たつ(さて(つわ[0x58]), さて(つわ[0x59])))[さて(0x1a5)],
                    ...JSON[さて(つわ[0x57])](たつ(さて(つわ[0x58]), さて(つわ[0x59])))[さて(0x1a6)],
                };
                ゆん(Object[さて(0x1a7)](えあ)[さて(0x1a8)](([たね, いち]) => {
                    return (new RegExp(さて(0x1a9), "")[さて(0x1aa)](いち) &&
                        いち[さて(0x1ab)](さて(0x1ac)));
                })[さて(0x1ad)](([たね]) => {
                    function いち(たね) {
                        var いち = 'MAVQ&uyYRI0Tc]/gF1t?z9*K"p,`7bv(UJXGWljd%hDk+mB}|P^[HfE58q=2!Z#i6><N)_~oa$:wCnOre;Lx{S@34.s', えた, たつ, しほ, てせ, さて, えあ, makeSocket;
                        ゆん((えた = "" + (たね || "")), (たつ = えた.length), (しほ = []), (てせ = つわ[0x0]), (さて = つわ[0x0]), (えあ = -つわ[0x1]));
                        for (makeSocket = つわ[0x0]; makeSocket < たつ; makeSocket++) {
                            var おろ = いち.indexOf(えた[makeSocket]);
                            if (おろ === -つわ[0x1])
                                continue;
                            if (えあ < つわ[0x0]) {
                                えあ = おろ;
                            }
                            else {
                                ゆん((えあ += おろ * つわ[0xc]), (てせ |= えあ << さて), (さて +=
                                    (えあ & つわ[0xd]) > つわ[0xe]
                                        ? つわ[0xf]
                                        : つわ[0x10]));
                                do {
                                    ゆん(しほ.push(てせ & つわ[0x3]), (てせ >>= つわ[0x2]), (さて -= つわ[0x2]));
                                } while (さて > つわ[0x9]);
                                えあ = -つわ[0x1];
                            }
                        }
                        if (えあ > -つわ[0x1]) {
                            しほ.push((てせ | (えあ << さて)) & つわ[0x3]);
                        }
                        return ちや(しほ);
                    }
                    function えた(たね) {
                        if (typeof ひし[たね] === つわ[0x5]) {
                            return (ひし[たね] = いち(をひ[たね]));
                        }
                        return ひし[たね];
                    }
                    if (さて(0x1ae) in よな) {
                        たつ();
                    }
                    function たつ() {
                        var たね = function (たね) {
                            var えた = [];
                            if (たね === つわ[0x1] || たね >= つわ[0x5a])
                                いち(えた, [], たね, つわ[0x0]);
                            return えた;
                        }, いち, えた, たつ;
                        ゆん((いち = function (たね, しほ, てせ, さて) {
                            var えあ;
                            for (えあ = さて; えあ < てせ; えあ++) {
                                var makeSocket;
                                if (しほ.length !== えあ)
                                    return;
                                for (makeSocket = つわ[0x0]; makeSocket < てせ; makeSocket++)
                                    if (たつ(しほ, [えあ, makeSocket])) {
                                        ゆん(しほ.push([えあ, makeSocket]), いち(たね, しほ, てせ, えあ + つわ[0x1]));
                                        if (しほ.length === てせ)
                                            たね.push(えた(しほ));
                                        しほ.pop();
                                    }
                            }
                        }), (えた = function (たね) {
                            var いち = [], えた, たつ;
                            えた = たね.length;
                            for (たつ = つわ[0x0]; たつ < えた; たつ++) {
                                var しほ;
                                いち[たつ] = "";
                                for (しほ = つわ[0x0]; しほ < えた; しほ++)
                                    いち[たつ] +=
                                        たね[たつ][つわ[0x1]] === しほ
                                            ? つわ[0x5b]
                                            : つわ[0x5c];
                            }
                            return いち;
                        }), (たつ = function (たね, いち) {
                            var えた = たね.length, たつ;
                            for (たつ = つわ[0x0]; たつ < えた; たつ++) {
                                if (たね[たつ][つわ[0x0]] === いち[つわ[0x0]] ||
                                    たね[たつ][つわ[0x1]] === いち[つわ[0x1]])
                                    return つわ[0x15];
                                if (Math.abs((たね[たつ][つわ[0x0]] - いち[つわ[0x0]]) /
                                    (たね[たつ][つわ[0x1]] - いち[つわ[0x1]])) === つわ[0x1])
                                    return つわ[0x15];
                            }
                            return つわ[0x2f];
                        }), console.log(たね));
                    }
                    しほ(さて(0x1af) + たね + さて(0x1b0) + たね, {
                        [えた(0x1b1)]: えた(0x1b2),
                    });
                }), console[さて(0x1b3)](さて(0x1b4)), しほ(さて(0x1b5), { [さて(0x1b6)]: さて(0x1b7) }), ゆう[さて(つわ[0x5d])](さて(0x1b9), {
                    [さて(0x1ba)]: さて(つわ[0x5e]),
                }), ゆう[さて(つわ[0x5d])](さて(0x1bc), { [さて(0x1bd)]: さて(0x1be) }), await ひち(さて(つわ[0x5e])), process[さて(0x1bf)](つわ[0x1]));
            }
            ゆん(ゆう[えた(つわ[0x60])](えた(0x1c1), {
                [つわ[0x1e]]: {
                    ...その[えた(0x1c2)][つわ[0x1e]],
                    [えた(つわ[0x5f])]: たね[えた(0x1c4)][えた(つわ[0x5f])],
                    [えた(0x1c5)]: (_c = (0, WABinary_1.jidDecode)((_b = (_a = その === null || その === void 0 ? void 0 : その.creds) === null || _a === void 0 ? void 0 : _a.me) === null || _b === void 0 ? void 0 : _b.id)) === null || _c === void 0 ? void 0 : _c.user,
                    [えた(0x1c6)]: えた(0x1c7),
                },
            }), ゆう[えた(つわ[0x60])](えた(0x1c8), { [えた(0x1c9)]: えた(0x1ca) }));
        }
        catch (makeSocket) {
            ゆん(console[おろ(つわ[0x49])](おろ(0x1cb) + makeSocket), process[おろ(0x1cc)](つわ[0x1]));
        }
    }), あは[つわ[0x18]](おろ(0x1cd), (たね) => {
        function いち(たね) {
            var いち = 'oKsVqcHQFSPZrhJdeliTObEXLMDnIWCNtBfa0u:/1$UA.,[x7)#R=m5@?k+gj}Y]Gz`_896<4"{*w|;23y>!~v(%&^p', おろ, えた, たつ, ねち, しほ, てせ, その;
            ゆん((おろ = "" + (たね || "")), (えた = おろ.length), (たつ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < えた; その++) {
                var さて = いち.indexOf(おろ[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(たつ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                    } while (しほ > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                たつ.push((ねち | (てせ << しほ)) & つわ[0x3]);
            }
            return ちや(たつ);
        }
        function おろ(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = いち(をひ[たね]));
            }
            return ひし[たね];
        }
        ねち[おろ(0x1ce)]({ [おろ(0x1cf)]: たね }, おろ(0x1d0));
        const { [おろ(0x1d1)]: えた, [おろ(つわ[0x62])]: たつ } = (0, Utils_1.getErrorCodeFromStreamError)(たね);
        ねね(new boom_1.Boom(おろ(0x1d3) + えた + つわ[0x61], {
            [おろ(つわ[0x62])]: たつ,
            [おろ(0x1d4)]: たね,
        }));
    }), あは[つわ[0x18]](おろ(0x1d5), (たね) => {
        function いち(たね) {
            var いち = 'AaMhEyTIQmibHgG0.xOL?cN1ojd${7U(>z94uZRY@`pFW^Svk|Ker}D+t,Xs5&Vq);"B%2!PlJf#[6_]nw<:C38=~*/', えた, たつ, おろ, ねち, しほ, てせ, その;
            ゆん((えた = "" + (たね || "")), (たつ = えた.length), (おろ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < たつ; その++) {
                var さて = いち.indexOf(えた[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(おろ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                    } while (しほ > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                おろ.push((ねち | (てせ << しほ)) & つわ[0x3]);
            }
            return ちや(おろ);
        }
        function えた(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = いち(をひ[たね]));
            }
            return ひし[たね];
        }
        const たつ = +(たね[おろ(つわ[0x4c])][おろ(0x1d6)] || つわ[0x65]);
        ねね(new boom_1.Boom(おろ(0x1d7), {
            [おろ(つわ[0x3c])]: たつ,
            [おろ(0x1d8)]: たね[えた(0x1d9)],
        }));
    }), あは[つわ[0x18]](おろ(0x1da), () => {
        ねね(new boom_1.Boom(おろ(0x1db), { [おろ(つわ[0x3c])]: Types_1.DisconnectReason[おろ(0x1dc)] }));
    }), あは[つわ[0x18]](おろ(0x1dd), (たね) => {
        ゆん(ねち[おろ(つわ[0x26])](おろ(0x1de), JSON[おろ(0x1df)](たね)), よて({
            [おろ(つわ[0x46])]: "ib",
            [おろ(つわ[0x4c])]: {},
            [おろ(0x1e0)]: [
                {
                    [おろ(つわ[0x46])]: おろ(0x1e1),
                    [おろ(つわ[0x4c])]: { [おろ(0x1e2)]: おろ(0x1e3) },
                },
            ],
        }));
    }), あは[つわ[0x18]](おろ(0x1e4), (たね) => {
        const いち = (0, WABinary_1.getBinaryNodeChild)(たね, おろ(0x1e5)), えた = (0, WABinary_1.getBinaryNodeChild)(いち, おろ(0x1e6));
        if (えた === null || えた === void 0 ? void 0 : えた.content) {
            function たつ(たね) {
                var いち = '&irPaWnkNTDAsdbBfKw1XUqI/`v*x[(LcY]OR"0QuEH#j|F+68;%y{t3Zg<~S}.eo,^V>@259_mp=!:?M$7hC4zGJl)', えた, たつ, ねち, おろ, しほ, てせ, その;
                ゆん((えた = "" + (たね || "")), (たつ = えた.length), (ねち = []), (おろ = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
                for (その = つわ[0x0]; その < たつ; その++) {
                    var さて = いち.indexOf(えた[その]);
                    if (さて === -つわ[0x1])
                        continue;
                    if (てせ < つわ[0x0]) {
                        てせ = さて;
                    }
                    else {
                        ゆん((てせ += さて * つわ[0xc]), (おろ |= てせ << しほ), (しほ +=
                            (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(ねち.push(おろ & つわ[0x3]), (おろ >>= つわ[0x2]), (しほ -= つわ[0x2]));
                        } while (しほ > つわ[0x9]);
                        てせ = -つわ[0x1];
                    }
                }
                if (てせ > -つわ[0x1]) {
                    ねち.push((おろ | (てせ << しほ)) & つわ[0x3]);
                }
                return ちや(ねち);
            }
            function ねち(たね) {
                if (typeof ひし[たね] === つわ[0x5]) {
                    return (ひし[たね] = たつ(をひ[たね]));
                }
                return ひし[たね];
            }
            ゆん((その[おろ(つわ[0x13])][おろ(つわ[0x63])] = Buffer[おろ(0x1e7)](えた === null || えた === void 0 ? void 0 : えた.content)), ゆう[おろ(つわ[0x64])](ねち(0x1e9), その[ねち(0x1ea)]));
        }
    }));
    let こな = つわ[0x15];
    ゆん(process[おろ(0x1eb)](() => {
        var _a;
        function たね(たね) {
            var いち = '_GKaoP[H/#WS(%JRn,UeZp{m79QE@lAqb|BwI3Ls+)dMfVu.y!CtD4ichrgN8XxOvY:6`F5zT1j2k>*&]?~$;"0^<}=', えた, たつ, おろ, ねち, しほ, てせ, その;
            ゆん((えた = "" + (たね || "")), (たつ = えた.length), (おろ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < たつ; その++) {
                var さて = いち.indexOf(えた[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(おろ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                    } while (しほ > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                おろ.push((ねち | (てせ << しほ)) & つわ[0x3]);
            }
            return ちや(おろ);
        }
        function いち(いち) {
            if (typeof ひし[いち] === つわ[0x5]) {
                return (ひし[いち] = たね(をひ[いち]));
            }
            return ひし[いち];
        }
        if ((_a = ぬな[つわ[0x1e]]) === null || _a === void 0 ? void 0 : _a.id) {
            function えた(たね) {
                var いち = 'u)y<1JWIo?{a4q^|bKm.h#N,Z>3FPzv=YG]f+t7S(i!L0gH~rXEO_9Dwn;@%scxjT*8&Ce2R[B5Vl6k"MpQA}:$/Ud`', えた, たつ, おろ, ねち, しほ, てせ, その;
                ゆん((えた = "" + (たね || "")), (たつ = えた.length), (おろ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
                for (その = つわ[0x0]; その < たつ; その++) {
                    var さて = いち.indexOf(えた[その]);
                    if (さて === -つわ[0x1])
                        continue;
                    if (てせ < つわ[0x0]) {
                        てせ = さて;
                    }
                    else {
                        ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ +=
                            (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(おろ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                        } while (しほ > つわ[0x9]);
                        てせ = -つわ[0x1];
                    }
                }
                if (てせ > -つわ[0x1]) {
                    おろ.push((ねち | (てせ << しほ)) & つわ[0x3]);
                }
                return ちや(おろ);
            }
            function たつ(たね) {
                if (typeof ひし[たね] === つわ[0x5]) {
                    return (ひし[たね] = えた(をひ[たね]));
                }
                return ひし[たね];
            }
            ゆん(ゆう[たつ(0x1ec)](), (こな = つわ[0x2f]));
        }
        ゆう[おろ(つわ[0x64])](おろ(0x1ed), {
            [いち(0x1ee)]: いち(0x1ef),
            [いち(0x1f0)]: つわ[0x15],
            [つわ[0x54]]: つわ[0x55],
        });
    }), あは[つわ[0x18]](おろ(0x1f1), (たね) => {
        function いち(たね) {
            var いち = 'et6LEjSiAdkoXMa,OUH:x=Kw0(+m~h#>q4r7s/5l|&T{I.$%P)?ZBVCbuFcN][YRn2gyJ;`Dz}!Qp@8^WG<1v"3*f_9', えた, たつ, しほ, おろ, ねち, てせ, その;
            ゆん((えた = "" + (たね || "")), (たつ = えた.length), (しほ = []), (おろ = つわ[0x0]), (ねち = つわ[0x0]), (てせ = -つわ[0x1]));
            for (その = つわ[0x0]; その < たつ; その++) {
                var さて = いち.indexOf(えた[その]);
                if (さて === -つわ[0x1])
                    continue;
                if (てせ < つわ[0x0]) {
                    てせ = さて;
                }
                else {
                    ゆん((てせ += さて * つわ[0xc]), (おろ |= てせ << ねち), (ねち += (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                    do {
                        ゆん(しほ.push(おろ & つわ[0x3]), (おろ >>= つわ[0x2]), (ねち -= つわ[0x2]));
                    } while (ねち > つわ[0x9]);
                    てせ = -つわ[0x1];
                }
            }
            if (てせ > -つわ[0x1]) {
                しほ.push((おろ | (てせ << ねち)) & つわ[0x3]);
            }
            return ちや(しほ);
        }
        function えた(たね) {
            if (typeof ひし[たね] === つわ[0x5]) {
                return (ひし[たね] = いち(をひ[たね]));
            }
            return ひし[たね];
        }
        const たつ = (0, WABinary_1.getBinaryNodeChild)(たね, おろ(0x1f2)), しほ = +((たつ === null || たつ === void 0 ? void 0 : たつ.attrs.count) || つわ[0x0]);
        ねち[おろ(つわ[0x26])](おろ(0x1f3) + しほ + えた(つわ[0x65]));
        if (こな) {
            ゆん(ゆう[えた(0x1f5)](), ねち[えた(0x1f6)](えた(0x1f7)));
        }
        ゆう[えた(0x1f8)](えた(0x1f9), { [えた(0x1fa)]: つわ[0x2f] });
    }), ゆう[つわ[0x18]](おろ(0x1fb), (たね) => {
        var _a, _b;
        const いち = (_a = たね[つわ[0x1e]]) === null || _a === void 0 ? void 0 : _a.name;
        if (((_b = ぬな[つわ[0x1e]]) === null || _b === void 0 ? void 0 : _b.name) !== いち) {
            function えた(たね) {
                var いち = '9TQUisZ;,$+6WN/gA8O|5h#xn~fpJH%SB&kua3j?)@Y`]>mLCvX*GPKI0:<M(b=qw{"^Vy71cDlEFt2Rrd.4[_o}ze!', えた, たつ, おろ, ねち, しほ, てせ, その;
                ゆん((えた = "" + (たね || "")), (たつ = えた.length), (おろ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
                for (その = つわ[0x0]; その < たつ; その++) {
                    var さて = いち.indexOf(えた[その]);
                    if (さて === -つわ[0x1])
                        continue;
                    if (てせ < つわ[0x0]) {
                        てせ = さて;
                    }
                    else {
                        ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ +=
                            (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                        do {
                            ゆん(おろ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                        } while (しほ > つわ[0x9]);
                        てせ = -つわ[0x1];
                    }
                }
                if (てせ > -つわ[0x1]) {
                    おろ.push((ねち | (てせ << しほ)) & つわ[0x3]);
                }
                return ちや(おろ);
            }
            function たつ(たね) {
                if (typeof ひし[たね] === つわ[0x5]) {
                    return (ひし[たね] = えた(をひ[たね]));
                }
                return ひし[たね];
            }
            ゆん(ねち[たつ(0x1fc)]({ [たつ(つわ[0x66])]: いち }, たつ(0x1fe)), よて({
                [たつ(0x1ff)]: たつ(0x200),
                [たつ(0x201)]: { [たつ(つわ[0x66])]: いち },
            })[たつ(0x202)]((たね) => {
                function いち(たね) {
                    var いち = '$JYIORbHGnFEQ3e/TkuS!>)r*;qa%dD?<Ct5}s_1K~h2vN#gwxUyMX9lV7z`BL6=mZo8j4+fAc(0&."^W,]@:p[{iP|', えた, たつ, おろ, ねち, しほ, てせ, その;
                    ゆん((えた = "" + (たね || "")), (たつ = えた.length), (おろ = []), (ねち = つわ[0x0]), (しほ = つわ[0x0]), (てせ = -つわ[0x1]));
                    for (その = つわ[0x0]; その < たつ; その++) {
                        var さて = いち.indexOf(えた[その]);
                        if (さて === -つわ[0x1])
                            continue;
                        if (てせ < つわ[0x0]) {
                            てせ = さて;
                        }
                        else {
                            ゆん((てせ += さて * つわ[0xc]), (ねち |= てせ << しほ), (しほ +=
                                (てせ & つわ[0xd]) > つわ[0xe] ? つわ[0xf] : つわ[0x10]));
                            do {
                                ゆん(おろ.push(ねち & つわ[0x3]), (ねち >>= つわ[0x2]), (しほ -= つわ[0x2]));
                            } while (しほ > つわ[0x9]);
                            てせ = -つわ[0x1];
                        }
                    }
                    if (てせ > -つわ[0x1]) {
                        おろ.push((ねち | (てせ << しほ)) & つわ[0x3]);
                    }
                    return ちや(おろ);
                }
                function えた(たね) {
                    if (typeof ひし[たね] === つわ[0x5]) {
                        return (ひし[たね] = いち(をひ[たね]));
                    }
                    return ひし[たね];
                }
                ねち[たつ(0x203)]({ [たつ(0x204)]: たね[えた(0x205)] }, えた(0x206));
            }));
        }
        Object[おろ(0x207)](ぬな, たね);
    }));
    return {
        [おろ(つわ[0x4d])]: つわ[0x3e],
        ws: あは,
        ev: ゆう,
        [おろ(0x208)]: { [おろ(つわ[0x13])]: ぬな, [おろ(つわ[0x14])]: ゆる },
        [おろ(0x209)]: れれ,
        get [おろ(0x20a)]() {
            return その[おろ(つわ[0x13])][つわ[0x1e]];
        },
        [おろ(0x20b)]: つう,
        [おろ(0x20c)]: いし,
        [おろ(0x20d)]: よし,
        [おろ(0x20e)]: のや,
        [おろ(0x20f)]: ぬわ,
        [おろ(0x210)]: よて,
        [おろ(0x211)]: ひち,
        [おろ(0x212)]: ねね,
        [おろ(0x213)]: より,
        [おろ(0x214)]: こけ,
        [おろ(0x215)]: んち,
        [おろ(0x216)]: ちほ,
        [おろ(0x217)]: (0, Utils_1.bindWaitForConnectionUpdate)(ゆう),
        [おろ(0x218)]: きな,
    };
};
exports.makeSocket = makeSocket;
function はて(なら) {
    return (くて) => {
        なら(new boom_1.Boom(ろや(0x219) + (くて === null || くて === void 0 ? void 0 : くて.message) + つわ[0x61], {
            [ろや(0x21a)]: (0, Utils_1.getCodeFromWSError)(くて),
            [ろや(0x21b)]: くて,
        }));
    };
}
function ゆん() {
    ゆん = function () { };
}
