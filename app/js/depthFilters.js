Depth.filter('projectsFilter', function (filterFilter, State) {
  return function (projects, options) {
    var validProjs = [];
    var vocabName = State.shared.currentSet.vocabName;
    angular.forEach (projects, function (project) {
      var validProject = true;

      // Filter by org type
      if (validProject && options.orgTypes && options.orgTypes.length > 0) {
        validProject = false;
        angular.forEach (options.orgTypes, function (orgType) {
          if (filterFilter(project.tags, {scheme: "http://www.sciencebase.gov/vocab/category/"+ vocabName +"/Project/OrganizationType", type: "Label", name: orgType.orgType}).length > 0) {
            validProject = true;
          }
        });
      }

      // Filter by org
      if (validProject && options.orgs && options.orgs.length > 0) {
        validProject = false;
        angular.forEach (options.orgs, function (org) {
          if (filterFilter(project.tags, {scheme: "http://www.sciencebase.gov/vocab/category/"+ vocabName +"/Project/OrganizationName", type: "Label", name: org.title}).length > 0) {
            validProject = true;
          }
        });
      }

      // Filter by fiscal year
      if (validProject && options.fys && options.fys.length > 0) {
        validProject = false;
        angular.forEach (options.fys, function (fy) {
          if (filterFilter(project.tags, {scheme: "http://www.sciencebase.gov/vocab/category/"+ vocabName +"/Project/FiscalYear", type: "Label", name: fy}).length > 0) {
            validProject = true;
          }
        });
      }

      // Filter by project type
      if (validProject && options.projTypes && options.projTypes.length > 0) {
        validProject = false;
        angular.forEach (options.projTypes, function (projType) {
          if (filterFilter(project.tags, {scheme: "http://www.sciencebase.gov/vocab/category/"+ vocabName +"/Project/ProjectType", type: "Label", name: projType}).length > 0) {
            validProject = true;
          }
        });
      }

      // Filter by pi
      if (validProject && options.pis && options.pis.length > 0) {
        validProject = false;
        angular.forEach (options.pis, function (pi) {
          var projPis = filterFilter(project.contacts, {type: "Principal Investigator"});
          if (findIndexByKeyValue(projPis, "name", pi.name) !== -1) {
            validProject = true;
          }
        });
      }

      // Filter by keyword
      if (validProject && options.kws && options.kws.length > 0) {
        validProject = false;
        angular.forEach (options.kws, function (kw) {
          var projKws = filterFilter(project.tags, {scheme: "http://www.sciencebase.gov/vocab/category/"+ vocabName +"/Keyword", type: "Keyword"});
          if (findIndexByKeyValue(projKws, "name", kw.name) !== -1) {
            validProject = true;
          }
        });
      }

      // Filter by project status
      if (validProject && options.projStatuses && options.projStatuses.length > 0) {
        validProject = false;
        angular.forEach (options.projStatuses, function (projStatus) {
          var projIdx = findIndexByKeyValue(project.facets, "className", "ProjectFacet");
          if (projIdx >= 0) {
            if (project.facets[projIdx].projectStatus === projStatus) {
              validProject = true;
            }
          }
        });
      }

      // Filter by agenda
      if (validProject && options.agenda && options.agenda.themes && options.agenda.themes.length > 0) {
        validProject = false;
        angular.forEach (options.agenda.themes, function (theme) {
          var expandoIdx = findIndexByKeyValue(project.facets, "className", "ExpandoFacet");
          if (expandoIdx >= 0 && project.facets[expandoIdx].object.agendas) {
            var agendas = project.facets[expandoIdx].object.agendas;
            for (var i in agendas) {
              if (agendas[i].name === options.agenda.name) {
                for (var j in agendas[i].themes) {
                  for (var k in agendas[i].themes[j].options) {
                    if (agendas[i].themes[j].options[k] === true && options.agenda.themes[j].options[k] === true) {
                      validProject = true;
                    }
                  }
                }
              }
            }
          }
        });
      }

      // Filter by project
      if (validProject && options.projects && options.projects.length > 0) {
        validProject = false;
        angular.forEach (options.projects, function (filterProject) {
          if (project.id === filterProject.id) {
            validProject = true;
          }
        });
      }


      if (validProject) {
        validProjs.push(project);
      }
    });

    return validProjs;
  }
});

Depth.filter('filterOrgs', function (filterFilter, State) {
  return function (orgs, options) {
    if (!options.orgTypes || options.orgTypes.length === 0 || !options.orgTypes[0]) {
      return orgs;
    }
    var validOrgs = [];
    angular.forEach (orgs, function (org) {
      angular.forEach (options.orgTypes, function (orgType) {
        var vocabName = State.shared.currentSet.vocabName;
        if (filterFilter(org.tags, {scheme: "http://www.sciencebase.gov/vocab/category/"+ vocabName +"/OrgLabel", type: "Label", name: orgType.orgType}).length > 0) {
          validOrgs.push(org);
        }
      });
      
    });
    return validOrgs;
  }
});

Depth.filter('filterParts', function () {
  return function (projects) {
    var validProjs = [];
    angular.forEach (projects, function (project) {
      var projIdx = findIndexByKeyValue(project.facets, "className", "ProjectFacet");
      if (projIdx > -1 && project.facets[projIdx].parts) {
        validProjs.push(project);
      }

    });
    return validProjs;
  }

});

Depth.filter('yearOnly', function() {
  return function (date) {
    if (date) {
      return date.substring(0,4);
    }
    else {
      return null;
    }
  }
});
