// Known disposable/temporary email domains - block these
const BLOCKED_DOMAINS = new Set([
  // Major temp mail services
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
  'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.info',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmail.net',
  'throwam.com', 'throwam.net', 'trashmail.com', 'trashmail.net',
  'trashmail.at', 'trashmail.io', 'trashmail.me', 'trashmail.xyz',
  'yopmail.com', 'yopmail.fr', 'yopmail.net',
  'maildrop.cc', 'mailnull.com', 'mailnesia.com', 'mailnull.net',
  'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'spam4.me',
  'dispostable.com', 'discard.email', 'discardmail.com', 'discardmail.de',
  'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org',
  'spamhereplease.com', 'spamfree24.org', 'spamspot.com',
  'mailnull.com', 'spamfree.eu', 'trbvm.com', 'trbvn.com',
  'fakeinbox.com', 'fakeinbox.net', 'fakemail.net', 'fake-box.com',
  'mailexpire.com', 'mailforspam.com', 'mailin8r.com', 'mailincubator.com',
  'mailismagic.com', 'mailme.ir', 'mailme.lv', 'mailmetrash.com',
  'mailmoat.com', 'mailnew.com', 'mailnull.com', 'mailpick.biz',
  'mailrock.biz', 'mailscrap.com', 'mailseal.de', 'mailshell.com',
  'mailsiphon.com', 'mailslapping.com', 'mailslite.com', 'mailss.ml',
  'mailtrash.net', 'mailtv.tv', 'mailtv.net', 'mailzilla.com',
  'mailzilla.org', 'makemetheking.com', 'manybrain.com',
  'mbx.cc', 'mega.zik.dj', 'meltmail.com', 'messagebeamer.de',
  'mezimages.net', 'mierdamail.com', 'ministry-of-silly-walks.de',
  'mintemail.com', 'misterpinball.de', 'moncourrier.fr.nf',
  'monemail.fr.nf', 'monmail.fr.nf', 'monumentmail.com',
  'mt2009.com', 'mt2014.com', 'mvfjj.com', 'mx0.wwwnew.eu',
  'mxfuel.com', 'my10minutemail.com', 'myalias.pw', 'myemailboxy.com',
  'myfastmail.com', 'mymailoasis.com', 'mynetstore.de', 'myopang.com',
  'myphantomemail.com', 'mysamp.de', 'mysendit.com', 'myspaceinc.com',
  'myspaceinc.net', 'myspaceinc.org', 'myspacepimpedup.com',
  'myspamless.com', 'mytemp.email', 'mytempemail.com',
  'mytempmail.com', 'mytrashmail.com', 'mywarnernet.net',
  'nada.email', 'nada.ltd', 'nospamfor.us', 'nospamthanks.info',
  'notmailinator.com', 'nowmymail.com', 'nullbox.info', 'nut.cc',
  'objectmail.com', 'odaymail.com', 'one-time.email', 'oneoffemail.com',
  'oneoffmail.com', 'onewaymail.com', 'online.ms', 'onqin.com',
  'opayq.com', 'opentrash.com', 'ordinaryamerican.net', 'otherinbox.com',
  'ourklips.com', 'ourpreviewdomain.com', 'outlawspam.com',
  'ovpn.to', 'owlpic.com',
  'pancakemail.com', 'paplease.com', 'payspun.com', 'pepbot.com',
  'pfui.ru', 'pimpedupmyspace.com', 'pingir.com', 'pjjkp.com',
  'plexolan.de', 'poczta.onet.pl', 'politikerclub.de', 'polyfaust.com',
  'pookmail.com', 'pop3.xyz', 'postacı.be', 'postalmail.biz',
  'postinbox.com', 'postpro.net', 'powered.name', 'privacy.net',
  'proxymail.eu', 'prtnx.com', 'punkass.com',
  'put2.net', 'putthisinyourspamdatabase.com',
  'qq.com', // commonly used for spam
  'rcpt.at', 'recode.me', 'recursor.net', 'recyclemail.dk',
  'regbypass.com', 'regbypass.comsafe-mail.net', 'rejectmail.com',
  'rklips.com', 'rmqkr.net', 'rootfest.net', 'rtrtr.com',
  'ruffrey.com', 'ruu.kr',
  's0ny.net', 'safe-mail.net', 'safetymail.info', 'safetypost.de',
  'sandelf.de', 'sast.ro', 'saynotospams.com', 'schafmail.de',
  'schmarotzer.de', 'secure-mail.biz', 'selfdestructingmail.com',
  'senseless-entertainment.com', 'services391.com', 'sharedmailbox.org',
  'shiftmail.com', 'shitmail.me', 'shitmail.org', 'shitware.nl',
  'shuermails.com', 'sibmail.com', 'sinnlos-mail.de',
  'skeefmail.com', 'slaskpost.se', 'slopsbox.com', 'slushmail.com',
  'smashmail.de', 'smellfear.com', 'snakemail.com', 'sneakemail.com',
  'sneakmail.de', 'snkmail.com', 'sofimail.com', 'sofort-mail.de',
  'sogetthis.com', 'soioa.com', 'solvemail.info', 'soodonims.com',
  'spam.la', 'spam.su', 'spam4.me', 'spamfree24.de',
  'spamfree24.eu', 'spamfree24.info', 'spamfree24.net', 'spamfree24.org',
  'spamgoes.in', 'spamherelots.com', 'spamhereplease.com',
  'spamhole.com', 'spamify.com', 'spaminator.de', 'spamkill.info',
  'spaml.com', 'spaml.de', 'spamoff.de', 'spamslicer.com',
  'spamspot.com', 'spamstack.net', 'spamthis.co.uk', 'spamthisplease.com',
  'spamtrail.com', 'spamtroll.net', 'speed.1s.fr', 'spikio.com',
  'spoofmail.de', 'squizzy.de', 'squizzy.eu', 'squizzy.net',
  'stealth.nl', 'stop-my-spam.com', 'streetwisemail.com',
  'submic.com', 'suremail.info', 'sweetxxx.de',
  'tafmail.com', 'tagyourself.com', 'teewars.org', 'teleworm.com',
  'teleworm.us', 'temp.emeraldwebmail.com', 'temp.headstrong.de',
  'temp.mail.y59.jp', 'tempail.com', 'tempalias.com',
  'tempe-mail.com', 'tempemail.biz', 'tempemail.co.za',
  'tempemail.com', 'tempemail.net', 'tempinbox.co.uk', 'tempinbox.com',
  'tempmail.de', 'tempmail.eu', 'tempmail.it', 'tempmail2.com',
  'tempomail.fr', 'temporarily.de', 'temporarioemail.com.br',
  'temporaryemail.net', 'temporaryemail.us', 'temporaryforwarding.com',
  'temporaryinbox.com', 'temporarymailaddress.com', 'tempsky.com',
  'tempthe.net', 'tempymail.com', 'thanksnospam.info',
  'thc.st', 'thelimestones.com', 'thisisnotmyrealemail.com',
  'throwam.com', 'throwam.net', 'throwaway.email', 'throwaways.co.uk',
  'throwam.com', 'tilien.com', 'tittbit.in', 'tizi.com',
  'tmail.com', 'tmail.io', 'tmailinator.com', 'toiea.com',
  'tokuriders.club', 'tomahawk.pro', 'totalvista.com', 'tradermail.info',
  'trash-amil.com', 'trash-mail.at', 'trash-mail.com', 'trash-mail.de',
  'trash-mail.ga', 'trash-mail.io', 'trash-mail.me', 'trash-mail.net',
  'trash2009.com', 'trashcanmail.com', 'trashdevil.com', 'trashdevil.de',
  'trashemail.de', 'trashimail.de', 'trashmail.at', 'trashmail.me',
  'trashmail.net', 'trashmail.xyz', 'trazo.nl',
  'trbvm.com', 'trbvn.com', 'trbvo.com',
  'trillianpro.com', 'trollproject.com', 'tryalert.com',
  'ttttt.ml', 'turual.com', 'twinmail.de', 'tyldd.com',
  'uggsrock.com', 'umail.net', 'undo.it', 'unids.com',
  'unimail.mn.mn', 'unlimit.com', 'unmail.ru', 'uny.kr',
  'uroid.com', 'username.e4ward.com', 'uwork4.us',
  'venompen.com', 'veryrealemail.com', 'viditag.com', 'viewcastmedia.com',
  'viewcastmedia.net', 'viewcastmedia.org', 'vinernet.com',
  'violinmakers.co.uk', 'vipmail.pw', 'vipmail.top',
  'vkcode.ru', 'vmailing.info', 'vmani.com', 'vomoto.com',
  'vpn.st', 'vsimcard.com', 'vubby.com',
  'w3internet.co.uk', 'walala.org', 'walkmail.net', 'walkmail.ru',
  'watchever.biz', 'watchfull.net', 'watchs.in', 'wbdet.com',
  'webm4il.info', 'webmail.kolmpuu.net', 'webprogramming.com',
  'websurfer.co.za', 'welikecookies.com', 'wellhungover.com',
  'wetrainbayarea.com', 'wetrainbayarea.org', 'wilemail.com',
  'willhackforfood.biz', 'willselfdestruct.com', 'winemaven.info',
  'wronghead.com', 'wuzupmail.net', 'www.e4ward.com',
  'www.gishpuppy.com', 'www.mailinator.com',
  'xagloo.co', 'xagloo.com', 'xemaps.com', 'xents.com', 'xmail.net',
  'xmaily.com', 'xoxy.net', 'xwaretech.com', 'xwaretech.info',
  'xwaretech.net', 'xww.ro', 'xy9ce.tk',
  'ya.ru', 'yapped.net', 'ycare.de', 'yep.it',
  'yogamaven.com', 'yomail.info', 'yoo.ro', 'yopmail.pp.ua',
  'youmails.online', 'yourdomain.com', 'ypmail.webarnak.fr.eu.org',
  'yroid.com', 'ytpmail.com',
  'zahadum.com', 'zcai.info', 'zebins.com', 'zebins.eu',
  'zehnminuten.de', 'zehnminutenmail.de', 'zetmail.com',
  'zippymail.info', 'zoaxe.com', 'zoemail.net', 'zoemail.org',
  'zomg.info', 'zumpul.com', 'zxcv.com', 'zxcvbnm.com',
  // Additional popular ones
  '10minutemail.com', '10minutemail.net', '10minutemail.org',
  '10minutemail.co.za', '10minutemail.de', '10minutemail.eu',
  '10minutemail.info', '10minutemail.nl', '10minutemail.us',
  '20minutemail.com', '20minutemail.it',
  '33mail.com', 'anonaddy.com', 'anonaddy.me',
  'burnermail.io', 'byom.de',
  'cock.li', 'cock.email',
  'deadaddress.com', 'despam.it', 'disposableaddress.com',
  'disposableinbox.com', 'disposablemail.com',
  'e4ward.com', 'emailisvalid.com', 'emailondeck.com',
  'filzmail.com', 'filzmail.de',
  'getonemail.com', 'getonemail.net', 'getnada.com',
  'harakirimail.com', 'hmamail.com',
  'inboxalias.com', 'inboxkitten.com',
  'jetable.com', 'jetable.fr.nf', 'jetable.net', 'jetable.org',
  'kasmail.com', 'keepmymail.com', 'killmail.com', 'killmail.net',
  'lastmail.co', 'lol.ovpn.to',
  'mail.tm', 'mail2tor.com', 'mailboxy.fun', 'maildax.me',
  'maileater.com', 'mailfreeonline.com', 'mailinator.net',
  'mailinator.org', 'mailinator2.com',
  'mailnesia.com', 'mailnull.com', 'mailtemp.info',
  'mailtemp.net', 'mailtemp.org',
  'moakt.cc', 'moakt.com', 'moakt.ws',
  'mohmal.com', 'mohmal.im', 'mohmal.in', 'mohmal.tech',
  'mucincanon.com',
  'nomail.pw', 'nomail.xl.cx', 'nomail2me.com', 'nospam.ze.tc',
  'nospam4.us', 'nospammail.net', 'nospamthanks.info',
  'objectmail.com', 'obobbo.com', 'oneoffmail.com',
  'owlpic.com',
  'pjjkp.com', 'plusplusemail.com', 'posteo.net',
  'privacypark.com', 'proxymail.eu',
  'qq.com',
  'sharedmailbox.org', 'sharklasers.com', 'spamgourmet.com',
  'spamgourmet.net', 'spamgourmet.org',
  'tempail.com', 'tempinbox.com', 'tempmail.net',
  'tempr.email', 'throwam.com',
  'trashmail.at', 'trashmail.com', 'trashmail.io',
  'trashmail.me', 'trashmail.net',
  'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org',
  'yopmail.com', 'yopmail.fr',
  'zmail.ru',
])

export type EmailValidationResult =
  | { valid: true }
  | { valid: false; reason: string }

export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim().toLowerCase()

  // Basic format check
  const emailRegex = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/
  if (!emailRegex.test(trimmed)) {
    return { valid: false, reason: 'Please enter a valid email address.' }
  }

  const parts = trimmed.split('@')
  if (parts.length !== 2) {
    return { valid: false, reason: 'Please enter a valid email address.' }
  }

  const domain = parts[1]

  // No IP address domains (e.g. user@192.168.1.1)
  const ipRegex = /^\d{1,3}(\.\d{1,3}){3}$/
  if (ipRegex.test(domain)) {
    return { valid: false, reason: 'Please use a real email address.' }
  }

  // Must have at least one dot in domain
  if (!domain.includes('.')) {
    return { valid: false, reason: 'Please enter a valid email address.' }
  }

  // Block known disposable domains
  if (BLOCKED_DOMAINS.has(domain)) {
    return { valid: false, reason: 'Temporary or disposable email addresses are not allowed.' }
  }

  // Check for subdomain variants of blocked domains
  // e.g. user@sub.mailinator.com should also be blocked
  const domainParts = domain.split('.')
  for (let i = 1; i < domainParts.length - 1; i++) {
    const parentDomain = domainParts.slice(i).join('.')
    if (BLOCKED_DOMAINS.has(parentDomain)) {
      return { valid: false, reason: 'Temporary or disposable email addresses are not allowed.' }
    }
  }

  return { valid: true }
}