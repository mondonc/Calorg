Calorg
======

A Modest personal encrypted Calendar/Organizer written in JS and PHP.

Calorg allows you to encrypt your appointments subjects, but NOT the start/end time. There is usefull if you want share your disponibilities without details about your rendezvous. Simply press enter at the password view displays an encrypted view of your calendar.
Installation
---

Download it from [Calorg github](https://github.com/mondonc/Calorg)

To use it : 

- copy all files in your webserver directory (`/var/www` for instance)
- Open `http://yourserver/calorg_install_path/init.html` in your browser
- Follow short instructions
- Have fun ! 


Warning : Server side do not support concurrency access.


Features
---

TODO


Licensing
----

Calorg is mainly based on [fullcalendar](http://arshaw.com/fullcalendar/), a jquery plugin that provides a full-sized, drag & drop calendar. It is open source and dual licensed under the i[MIT](http://arshaw.com/js/fullcalendar-1.5.4/MIT-LICENSE.txt) or [GPL](http://arshaw.com/js/fullcalendar-1.5.4/GPL-LICENSE.txt) Version 2 licenses.

Encryption part use [sjcl](http://crypto.stanford.edu/sjcl/). sjcl is dual-licensed under the [GNU GPL version 2.0 or higher, and a
2-clause BSD license](https://github.com/bitwiseshiftleft/sjcl/blob/master/README/COPYRIGHT). 

Like fullcalendar, Calorg use [jquery](http://jquery.com/) licensed under [MIT](https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt)


All of these external tools are included in Calorg. Unlike fullcalendar, Calorg implements a server side with small PHP scripts. All datas are stored into simple JSON files. Calorg itself is licensed under [GPLv3](https://raw.github.com/mondonc/Calorg/master/LICENSE.txt)

