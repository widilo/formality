import { el, uid } from './helpers'
import validate from './validate'
import uiux from './uiux'
import emergence from '../vendor/emergence.formality'

export default {
  init() {
    this.build()
    this.legend()
  },
  build() {
    //build navigation list
    //build required fields legend
    let nav = this
    $(el("form")).each(function() {
      uid($(this))
      const $steps = $(el("section", "uid"))
      if($steps.length > 1) {
        let stepn = 0
        $(el("button", "uid", "--prev")).toggle(false)
        $(el("submit", "uid")).toggle(false)
        $steps.each(function(){
          const head_html = $(this).find(el("section_header")) ? $(this).find(el("section_header")).html() : '';
          const $required = $(this).find(el("field_required"))
          //build legend
          let legend = ""
          for (let i = 0; i < $required.length; i++) {
            const inputname = $required.eq(i).find(":input").attr("name")
            legend += '<li data-name="'+inputname+'"></li>'
          }
          let step_class = el("nav_section", false)
          step_class += stepn==0 ? " " + el("nav_section", false, "--active"): ""
          step_class += !head_html ? " " + el("nav_section", false, "--hidden"): ""
          let step_html = '<li class="' + step_class + '"><a href="#" data-step="'+stepn+'"><div>'+ head_html +'</div></a><ul class="'+el("nav_legend", false)+'">'+legend+'</ul></li>'
          $(el("nav_list", "uid")).append(step_html)
          stepn++
        })
        nav.standard()
      } else {
        if($(el("form", "uid")).hasClass(el("form", false, "--conversational"))) {
          let section = 0
          let liststring = ""
          liststring = liststring + '<li class="' + el("nav_anchor", false)+'"><a href="#"></a><ul>'
          $(el("section", "uid", "--active > *")).each(function(){
            section++
            const id = "field_" + uid(false, false) + "_" + section
            let label = ""
            const fieldid = $(this).find(":input").attr("id")
            $(this).attr("id", id)
            if($(this).hasClass(el("field", false))) {
              label = $(this).find(el("label", true)).first().text()
              liststring = liststring + '<li data-name="'+fieldid+'"><a href="#' + id + '">' + label + '</a></li>'
            } else if($(this).hasClass(el("section_header", false))) {
              label = $(this).find("h4").text()
              liststring = liststring + '</ul></li><li class="' + el("nav_anchor", false)+'"><a href="#' + id + '">' + label + '</a><ul>'
            }
          })
          $(el("nav_list", "uid")).append(liststring + '</ul></li>')
          $(el("nav", "uid")).append('<div class="formality__nav__buttons"><button type="button" class="formality__btn formality__btn--miniprev"></button><button type="button" class="formality__btn formality__btn--mininext"></button></div>')
          nav.conversational()
        } else {
          nav.standard()
          $(el("button", "uid", "--prev")).toggle(false)
          $(el("button", "uid", "--next")).toggle(false)
        }
        validate.form()
      }
    })
  },
  standard() {
    //gotostep function
    $(el("nav_section", true, " a[data-step]")).click(function(e){
      const index = $(this).attr("data-step")
      uid($(this))
      e.preventDefault()
      gotoStep(index)
    })
    $(el("button", true, "--next")).click(function(e){
      e.preventDefault()
      uid($(this))
      gotoStep(current()+1)
    })
    $(el("button", true, "--prev")).click(function(e){
      uid($(this))
      e.preventDefault()
      gotoStep(current()-1)
    })
    function gotoStep(index) {
      const currentstep = current();
      if(validate.checkstep(currentstep, index)) {
        const $steps = $(el("section", "uid"))
        const $nav = $(el("nav_section", "uid"))
        const atTheEnd = index >= $steps.length - 1
        anim(index)
        $steps.removeClass(el("section", false, "--active")).eq(index).addClass(el("section", false, "--active"))
        $nav.removeClass(el("nav_section", false, "--active")).eq(index).addClass(el("nav_section", false, "--active"))
        setTimeout(function() {
          let $selector = $(el("section", "uid", "--active") + " " + el("field"))
          $selector = currentstep > index ? $selector.last() : $selector.first();
          $selector.find(":input").focus();
        }, 400)
        $(el("button", "uid", "--prev")).toggle(index > 0)
        $(el("button", "uid", "--next")).toggle(!atTheEnd)
        $(el("submit", "uid")).toggle(atTheEnd)
      }
    }
    //step animations
    function anim(index) {
      const animclasses = "moveFromRight moveToRight moveFromLeft moveToLeft"
      $(el("section", "uid", "--active")).removeClass(animclasses).addClass((index > current() ? "moveToLeft" : "moveToRight" ))
      $(el("section", "uid")).eq(index).removeClass(animclasses).addClass((index > current() ? "moveFromRight" : "moveFromLeft" ))
    }
    //get current step
    function current() {
      const $steps = $(el("section", "uid"))
      return $steps.index($steps.filter(el("section", "uid", "--active")))
    }
  },
  legend() {
    //legend click
    $(el("nav_section", true, " li[data-name]")).click(function(e) {
      e.preventDefault()
      uid($(this))
      const name = $(this).attr("data-name")
      $(el("section", "uid") + " " + el("field") + " :input[name="+name+"]").focus()
    })
  },
  conversational() {
    let emergence_container = document.querySelector('.formality__main');
    let emergence_current = 0;
    if($("body").hasClass("body-formality")) {
      emergence_container = window;
    }
    emergence.init({
      selector: el("field", "uid"),
      container: emergence_container,
      offsetY: "50%",
      callback: function(element, state) {
        if (state === 'visible') {
          const $el = $(element);
          let emergence_active = $el.attr("id");
          if(emergence_current!==emergence_active) {
            emergence_current = emergence_active;
            const sended = $el.closest(el("form", true, "--sended")).length
            const sectionid = $el.attr("id")
            const $navlist = $(el("nav_list", "uid"))
            const $navlink = $navlist.find('a[href="#'+sectionid+'"]');
            const scrollpx = parseInt(Math.max(0, ($navlink.position().left + $navlist.scrollLeft() - ($navlist.width()/2) + ($navlink.width()/2)) ));
            $(el("nav_list", "uid", " a")).removeClass("active")
            $navlink.addClass("active")
            $navlink.closest(el("nav_anchor")).find("> a").addClass("active")
            $navlist.stop().animate({ scrollLeft: scrollpx }, 100)
            if(!$el.hasClass("formality__field--focus")) {
              if(!sended) { $el.find(":input").focus() }
            }
          }
        }
      },
    });

    $(el("button", "uid", "--mininext")).click(function(e){
      let $element = $(el("field_focus")).find(":input")
      uiux.move($element, "next", e)
    })
    $(el("button", "uid", "--miniprev")).click(function(e){
      let $element = $(el("field_focus")).find(":input")
      uiux.move($element, "prev", e)
    })
    $(el("nav_anchor", "uid", " a")).click(function(e){
      //e.preventDefault()
      const fieldid = $(this).attr("href")
      let $element = $(fieldid).find(":input")
      if($(this).parent().hasClass(el("nav_anchor", false))) {
        uiux.move($(fieldid), "first", e)
      } else {
        uiux.move($element, false, e)
      }
    })
  },
};
