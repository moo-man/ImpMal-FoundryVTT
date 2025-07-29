if (this.item.getFlag("impmal", "collapsed"))
{
  this.script.notification("Unfolded Stock")
}
else 
{
  this.script.notification("Folded Stock")
}

this.item.setFlag("impmal", "collapsed", !this.item.getFlag("impmal", "collapsed"))