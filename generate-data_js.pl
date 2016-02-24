#!/usr/bin/perl
##########################################################################
# generate-data_js.pl - Generate data.js for dotabuffcp                  #
# Copyright (C) <2014>  Onur Aslan  <onuraslan@gmail.com>                #
#                                                                        #
# See COPYING for distribution information.                              #
##########################################################################


use strict;
use warnings;
use LWP::Simple;
use JSON;
use POSIX qw/strftime/;


my $DEBUG = 0;
my @heroes;
my @heroes_bg;
my @heroes_wr;
my @win_rates;


sub read_data {
  my $content = '';
  $content .= $_ while (<DATA>);
  return $content;
}


sub hero_link {
  my $hero = $_[0];
  $hero =~ s/'//g;
  $hero =~ s/ /-/g;
  $hero =~ tr/[A-Z]/[a-z]/;
  return $hero;
}


sub hero_id {
  my $hero = $_[0];

  my $c = 0;
  for (@heroes) {
    return $c if ($_ eq $hero);
    ++$c;
  }
  return -1;
}


sub get_heroes {

  $DEBUG and warn "Getting hero list\n";

  my $content = get ('http://dotabuff.com/heroes') or die;
  (@heroes_bg) = $content =~ /background: url\((.*?)\)/g;
  (@heroes) = $content =~ /<div class="name">(.*?)<\/div>/g;
  $_ =~ s/'// for (@heroes);  # fix name of nature's prophet
  $_ =~ s/&.*?;// for (@heroes);
  $_ =~ s/&#47;/\//g for (@heroes_bg);
}



sub get_winrates_of_hero {
  my ($hero, $hid) = ($_[0], hero_id ($_[0]));

  $DEBUG and warn "Getting winrates of $hero\n";

  my $content = get ('http://dotabuff.com/heroes/' .
                     hero_link ($hero) .
                     '/matchups') or die;
  
  my (@wr) = $content =~ /<dl><dd><span class="(?:won|lost)">(.*?)%<\/span><\/dd><dt>Win Rate<\/dt><\/dl>/g;
  $heroes_wr[$hid] = $wr[0];

  my $re = qr|<td class="cell-xlarge"><a class="link-type-hero" href="/heroes/.*?">(.*?)</a></td><td data-value="(.*?)">.*?%<div class="bar bar-default"><div class="segment segment-advantage" style="width: [\d.]+%;"></div></div></td><td data-value="(.*?)">.*?%<div class="bar bar-default"><div class="segment segment-win" style="width: [\d.]+%;"></div></div></td><td data-value="\d+">([\d,]+)<div class="bar bar-default"><div class="segment segment-match" style="width: [\d.]+%;"></div></div></td></tr>|;

  my (@heros) = $content =~ /$re/g;

  my $c = 0;
  my @a;

  for (@heros) {
    $_ =~ s/&.*?;// if $c == 0;
    $_ =~ s/,// if $c == 3;

    push @a, $_;
    ++$c;
    if ($c == 4) {
      $win_rates[$hid][hero_id ($a[0])] = [ @a[1..3] ];
      $c = 0;
      @a = ();
    }
  }

}


sub get_winrates {
  get_winrates_of_hero ($_) for (@heroes);
}


sub print_winrates {
  my $json = JSON->new;

  $DEBUG and warn "Writing win rates to data.js\n";

  open my $fh, '>data.js';

  print $fh 'var heroes = ', $json->encode ([ @heroes ]);
  print $fh ', heroes_bg = ', $json->encode ([ @heroes_bg ]);
  print $fh ', heroes_wr = ', $json->encode ([ @heroes_wr ]);
  print $fh ', win_rates = ', $json->encode ([ @win_rates ]);
  print $fh ', update_time = "',
               strftime("%Y-%m-%d", localtime (time ())),
               "\";\n";
  close $fh;
}


$_ eq '--debug' and $DEBUG++ for @ARGV;

get_heroes ();
get_winrates ();
print_winrates ();

__DATA__
